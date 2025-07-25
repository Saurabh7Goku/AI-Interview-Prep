import { useEffect, useState } from "react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import CodeEditor from "@uiw/react-codemirror";
import { dracula } from "@uiw/codemirror-theme-dracula";

export default function InterviewQuestion({
    question,
    index,
    total,
    onNext,
}: {
    question: string;
    index: number;
    total: number;
    onNext: (answer: string) => void;
}) {

    const isCodeQuestion = /(write|provide|implement|create).*(code|program|sql|python)|sql.*code|\(?\s*Coding Question\s*\)?\s*$/i.test(question);//REGEX for filtering Coding Ques..

    const [codeAnswer, setCodeAnswer] = useState("");

    const { transcript, isListening, startListening, stopListening, resetTranscript } =
        useSpeechRecognition();
    useEffect(() => {
        resetTranscript();
        setCodeAnswer("");
    }, [question]);

    const handleNextClick = () => {
        if (isListening) {
            stopListening();
            resetTranscript();
        }

        if (isCodeQuestion) {
            onNext(codeAnswer || "// No code written");
        } else {
            onNext(transcript || "No answer recorded");
        }
    };

    const handleSkipClick = () => {
        if (isListening) {
            stopListening();
            resetTranscript();
        }
        onNext("Skipped");
    };

    return (
        <div className="bg-black/5 p-6 rounded shadow max-w-2xl mx-auto">
            <p className="text-sm text-gray-300 mb-2">Q{index} of {total}</p>
            <h2 className="text-sm md:text-lg font-medium mb-4 text-white">{question}</h2>

            {/* Show Code Editor if it's a code question */}
            {isCodeQuestion ? (
                <div className="mt-4">
                    <label className="block text-sm text-blue-700 font-medium mb-2">Write your code here:</label>
                    <CodeEditor
                        value={codeAnswer}
                        height="250px"
                        theme={dracula}
                        onChange={(value) => setCodeAnswer(value)}
                        extensions={[]}
                        style={{ fontSize: "14px" }}
                    />
                </div>
            ) : (
                <>
                    <button
                        type="button"
                        onClick={isListening ? stopListening : startListening}
                        className={`px-3 py-1 md:px-6 md:py-2 rounded ${isListening ? "bg-red-500" : "bg-green-700"} text-white`}
                    >
                        {isListening ? "Stop Talking" : "Start Talking"}
                    </button>

                    {transcript && (
                        <div className="mt-4 p-3 bg-gray-100 rounded">
                            <strong>Your Answer:</strong>
                            <p>{transcript}</p>
                        </div>
                    )}
                </>
            )}

            {/* Buttons */}
            <div className="mt-6 flex justify-between">
                <button
                    type="button"
                    onClick={handleSkipClick}
                    className="bg-blue-600 hover:bg-gray-600 text-white px-3 py-1 md:px-6 md:py-2 rounded transition-colors"
                >
                    Skip
                </button>
                <button
                    type="button"
                    onClick={handleNextClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 md:px-6 md:py-2 rounded transition-colors"
                >
                    Next
                </button>
            </div>
        </div>
    );
}