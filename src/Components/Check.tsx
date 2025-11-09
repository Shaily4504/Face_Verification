// src/components/Verify.tsx
import { useRef, useEffect, useState } from 'react'
import * as faceapi from '@vladmandic/face-api'
import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'
import * as api from '../Services/api' // must export identifyStudent(apiBase, payload)
import VirtualID from './VirtualID'

export default function Check({ apiBase }: { apiBase: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [status, setStatus] = useState('Loading models...')
  const [loadingModels, setLoadingModels] = useState(true)
  const [identifying, setIdentifying] = useState(false)
  const [result, setResult] = useState<{ studentId: string; name: string; score?: number } | null>(null)
  const [cardOpen, setCardOpen] = useState(false)
  const [cardStudent, setCardStudent] = useState<{ studentId:string; name:string; } | null>(null)

  useEffect(() => {
    let mounted = true
    async function init() {
      try {
        await tf.setBackend('webgl')
        await tf.ready()
        const MODELS = '/models' // public/models
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODELS)
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODELS)
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODELS)
        if (!mounted) return
        setLoadingModels(false)
        setStatus('Models loaded — allow camera')
        await startCamera()
      } catch (e) {
        console.error(e)
        setStatus('Failed to load models')
      }
    }
    init()
    return () => { mounted = false }
  }, [])

  async function startCamera() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      if (videoRef.current) {
        videoRef.current.srcObject = s
        videoRef.current.muted = true
        await videoRef.current.play()
        setStatus('Camera running — press Scan')
      }
    } catch (e) {
      console.error(e)
      setStatus('Camera access denied')
    }
  }

  async function scanOnce() {
    if (loadingModels) { setStatus('Models loading...'); return }
    if (!videoRef.current) { setStatus('Camera not ready'); return }
    if (identifying) return
    setIdentifying(true)
    setResult(null)
    setStatus('Detecting face...')

    try {
      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
      const detection = await faceapi
        .detectSingleFace(videoRef.current as HTMLVideoElement, options)
        .withFaceLandmarks(true)
        .withFaceDescriptor()

      if (!detection || !detection.descriptor) {
        setStatus('No face detected. Try again.')
        setIdentifying(false)
        return
      }

      const embedding = Array.from(detection.descriptor) as number[] // should be 128
      setStatus('Identifying...')
      const resp = await (api as any).identifyStudent(apiBase, { embedding }) // ensure api.identifyStudent exists
      const data = resp?.data
      
      if (data?.matched) {
        const student = { studentId: data.student.studentId, name: data.student.name }
        setResult({ studentId: data.student.studentId, name: data.student.name, score: Number(data.score?.toFixed?.(3) ?? 0) })
        setStatus(`Matched: ${data.student.name}`)
        setCardStudent(student)
        setCardOpen(true)
      } else {
        setResult(null)
        setStatus(`No match (bestScore: ${data?.bestScore ?? 'N/A'})`)
      }
    } catch (err: any) {
      console.error('identify failed', err)
      setStatus(err?.response?.data?.error ?? err?.message ?? 'Identify error')
    } finally {
      setIdentifying(false)
    }
  }

    async function handleMarkPresent() {
    if (!cardStudent) {
      setCardOpen(false)
      return
    }

        try {
      setStatus('Marking present...')
      // Prefer api helper if available
      if ((api as any).markPresent) {
        await (api as any).markPresent(apiBase, { studentId: cardStudent.studentId })
      } else {
        // fallback: POST to /attendance/mark (add this route on server or change to your API)
        await fetch(`${apiBase}/attendance/mark`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: cardStudent.studentId })
        })
      }
      setStatus('Marked present ✅')
      // small success UI: you can trigger confetti here
      // import confetti from 'canvas-confetti'; confetti({ particleCount: 40, spread: 80 })
    } catch (e) {
      console.error('mark present error', e)
      setStatus('Failed to mark present')
    } finally {
      setCardOpen(false)
      setCardStudent(null)
    }
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="mb-4">
        <video ref={videoRef} playsInline muted autoPlay className="w-full rounded" />
      </div>

      <div className="flex gap-3">
        <button onClick={scanOnce} disabled={loadingModels || identifying} className="px-4 py-2 bg-teal-600 text-white rounded">
          {identifying ? 'Scanning...' : 'Scan & Verify'}
        </button>
        <button onClick={() => { setResult(null); setStatus('Ready') }} className="px-4 py-2 bg-gray-200 rounded">Reset</button>
      </div>

      <div className="mt-4">
        <div>Status: {status}</div>
        {result ? (
          <div className="mt-2 p-3 border rounded bg-green-50">
            <div className="font-bold">{result.name}</div>
            <div>ID: {result.studentId}</div>
            <div>Score: {result.score}</div>
          </div>
        ) : null}
      </div>
      <VirtualID
        open={cardOpen}
        student={cardStudent}
        autoHideMs={6000}
        onClose={() => { setCardOpen(false); setCardStudent(null) }}
        onMarkPresent={handleMarkPresent}
      />
    </div>
  )
}
