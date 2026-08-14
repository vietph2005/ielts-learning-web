import apiClient from '@/lib/apiClient';

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
      ? `/students/${studentId}/histories?skill=${skill}`
      : `/students/${studentId}/histories`;
    return await apiClient.get<TestHistory[]>(url);
  } catch (error) {
    console.error('Error fetching test history:', error);
    throw error;
  }
};

export const getTestDetails = async (testId: string): Promise<TestHistory> => {
  try {
    return await apiClient.get<TestHistory>(`/tests/${testId}`);
  } catch (error) {
    console.error('Error fetching test details:', error);
    throw error;
  }
};