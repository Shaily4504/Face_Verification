// src/Services/api.ts
import axios from 'axios'

export const enrollStudent = (apiBase: string, payload: any) => {
  return axios.post(`${apiBase}/students/enroll`, payload)
}

export const fetchClassStudents = (apiBase: string, classId: string) => {
  return axios.get(`${apiBase}/students/class/${classId}`)
}

// NEW: identify endpoint
export const identifyStudent = (apiBase: string, payload: { embedding: number[], classId?: string, markPresent?: boolean }) => {
  return axios.post(`${apiBase}/students/identify`, payload)
}
