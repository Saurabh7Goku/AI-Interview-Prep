# PreplystHub - AI 🚀

**PreplystHub - AI** is a state-of-the-art, AI-powered interview preparation platform designed to help candidates, especially students and freshers, ace their dream job interviews. By leveraging advanced generative AI, PreplystHub provides a personalized, interactive, and data-driven preparation experience that goes far beyond traditional static question lists.

---

## 🌟 What this project does

PreplystHub - AI acts as a virtual interview coach. It offers a comprehensive suite of tools to guide users through every stage of the hiring process:

- **AI-Powered Mock Interviews**: Simulates real-world interview scenarios with role-specific questions (Technical, HR, Managerial) that adapt to the user's experience level.
- **Intelligent Resume Scanner**: Analyzes resumes using AI to provide detailed feedback on content, structure, and impact.
- **ATS Optimization Dashboard**: Calculates an ATS (Applicant Tracking System) score and provides actionable suggestions to help resumes pass through automated filters.
- **Real-time Feedback & Scoring**: Provides instant evaluation of interview answers, including ideal answers and performance scores.
- **Interactive Experience**: Features Text-to-Speech (TTS) for auditory question delivery and webcam integration for practicing body language.
- **Progress Tracking**: Maintains a history of past interviews and scans, allowing users to visualize their improvement over time.

---

## 💡 Why the need for Creating this?

The journey from being a student to a professional is often hindered by the "Interview Gap." Traditional preparation methods are often:

1. **Generic**: Online lists of "top 50 questions" rarely match the specific role or the candidate's unique background.
2. **Passive**: Reading answers is not the same as speaking them. Candidates often struggle with articulation during the actual interview.
3. **Anxiety-Inducing**: The lack of a safe space to practice leads to high stress during real interviews.
4. **Feedback-Free**: Most candidates never know why they weren't selected or how they could have improved their answers.

**PreplystHub - AI** was created to bridge this gap by providing a high-fidelity simulation environment where candidates can fail safely, learn quickly, and build the confidence needed to succeed.

---

## 🎓 How it's better for Students

PreplystHub - AI is specifically optimized for the student and fresher demographic, offering several advantages over traditional methods:

- **Personalized Learning Path**: Unlike static resources, the AI understands whether you are a fresher or an experienced professional and adjusts the difficulty and nature of the questions accordingly.
- **Confidence Building through Simulation**: The combination of webcam practice and voice-enabled questions creates a realistic environment that desensitizes students to interview pressure.
- **Data-Driven Resume Mastery**: Most students don't know why their resumes are being rejected. Our ATS Dashboard gives them the exact "why" and "how to fix it."
- **Immediate Iteration**: Students can see the "Ideal Answer" for any question they struggle with, allowing for instant learning and correction.
- **Accessibility**: Available 24/7, providing a professional-grade coaching experience without the high cost of human mentors.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15+, React 19, TypeScript, Tailwind CSS
- **Backend/Database**: Firebase (Auth, Firestore)
- **AI Engine**: Google Gemini AI (@google/generative-ai)
- **State Management**: Zustand
- **Animations**: Framer Motion
- **UI Components**: Lucide React, Headless UI, CodeMirror
- **Data Visualization**: Recharts

---

## 🚀 Getting Started

### Prerequisites
- Node.js (Latest LTS)
- Firebase Account
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Saurabh7Goku/AI-Interview-Prep.git
   cd AI-Interview-Prep
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory and add your credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the application in action.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for the next generation of professionals.
