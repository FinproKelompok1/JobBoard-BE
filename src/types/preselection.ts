export interface IReqBody {
  title: string;
  description: string;
  jobId: string;
  preselectionQuestions: IPreTest[];
}

interface IPreTest {
  question: string;
  options: string[];
  correctAnswer: number;
}
