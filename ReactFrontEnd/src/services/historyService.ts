import { API_URL } from "@/config/api";
import axios from 'axios';

export interface TestHistory {
  id?: string;
  testID: string;
  username: string;
  skill: 'listening' | 'reading' | 'writing' | 'speaking' | 'fulltest';
  submittedAt: string;
  band: number;
}



export const getStudentTestHistory = async (studentId: string, skill?: string): Promise<TestHistory[]> => {
  try {
    const url = skill 
      ? `${API_URL}/api/students/${studentId}/history?skill=${skill}`
      : `${API_URL}/api/students/${studentId}/history`;
    const response = await axios.get(url, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error fetching test history:', error);
    throw error;
  }
};

export const getTestDetails = async (testId: string): Promise<TestHistory> => {
  try {
    const response = await axios.get(`${API_URL}/tests/${testId}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error fetching test details:', error);
    throw error;
  }
}; 