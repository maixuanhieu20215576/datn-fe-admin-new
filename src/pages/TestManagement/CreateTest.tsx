import { useState } from "react";

import axios from "axios";
import { useAccessToken } from "../../components/common/utils";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import FileInput from "../../components/form/input/FileInput";

interface QuestionInput {
  question: string;
  choices: string[];
  correctAnswer: number;
  type: string | undefined;
  subQuestions?: SubQuestion[];
  audio?: string;
}

type SubQuestion = {
  question: string;
  choices: string[];
  correctAnswer: number;
};

export default function CreateTest() {
  const token = useAccessToken();

  const [testName, setTestName] = useState("");
  const [maxGrade, setMaxGrade] = useState<number>(0);
  const [timeLimit, setTimeLimit] = useState<number>(30);
  const [questions, setQuestions] = useState<QuestionInput[]>([
    {
      question: "",
      choices: ["", "", "", ""],
      correctAnswer: 0,
      type: "Grammar",
    },
  ]);
  const [activeIndex, setActiveIndex] = useState(0);
  const questionType = [
    { value: "Reading", label: "Bài đọc" },
    { value: "Listening", label: "Bài nghe" },
    { value: "Grammar", label: "Ngữ pháp" },
  ];

  // Thêm câu hỏi mới
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        choices: ["", "", "", ""],
        correctAnswer: 0,
        type: "Grammar",
      },
    ]);
    setActiveIndex(questions.length);
  };
  const removeQuestion = (index: number) => {
    if (questions.length === 1) return;
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    if (activeIndex >= newQuestions.length) {
      setActiveIndex(newQuestions.length - 1);
    }
  };

  const addSubQuestion = (index: number) => {
    const updated = [...questions];
    if (!updated[index].subQuestions) updated[index].subQuestions = [];
    updated[index].subQuestions.push({
      question: "",
      choices: ["", "", "", ""],
      correctAnswer: 1,
    });
    setQuestions(updated);
  };

  const updateSubQuestion = (
    index: number,
    subIndex: number,
    field: "question" | "choice",
    value: string,
    choiceIndex?: number
  ) => {
    const updated = [...questions];
    if (field === "question") {
      if (updated[index].subQuestions) {
        updated[index].subQuestions[subIndex].question = value;
      }
    } else if (field === "choice" && choiceIndex !== undefined) {
      if (updated[index].subQuestions) {
        updated[index].subQuestions[subIndex].choices[choiceIndex] = value;
      }
    }
    setQuestions(updated);
  };

  const updateCorrectSubAnswer = (
    index: number,
    subIndex: number,
    choiceIndex: number
  ) => {
    const updated = [...questions];
    if (updated[index].subQuestions) {
      updated[index].subQuestions[subIndex].correctAnswer = choiceIndex + 1;
    }
    setQuestions(updated);
  };

  const updateCorrectAnswer = (index: number, choiceIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[index].correctAnswer = choiceIndex + 1; // 1-based index
    setQuestions(newQuestions);
  };
  const updateQuestion = async (
    index: number,
    field: "question" | "choice" | "type" | "audio",
    value: string | File,
    choiceIndex?: number
  ) => {
    const newQuestions = [...questions];
    if (field === "question" && typeof value === "string") {
      newQuestions[index].question = value;
    } else if (
      field === "choice" &&
      choiceIndex !== undefined &&
      typeof value === "string"
    ) {
      newQuestions[index].choices[choiceIndex] = value;
    } else if (field === "type" && typeof value === "string") {
      newQuestions[index].type = value;
    } else if (field === "audio") {
      let formData = new FormData();
      formData.append('file', value)
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/user/upload-file`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      newQuestions[index].audio = response.data;
    }
    setQuestions(newQuestions);
  };

  const handleSubmit = async () => {
    if (!testName) {
      alert("Vui lòng nhập tên bài thi!");
      return;
    }
    if (timeLimit <= 0 || !timeLimit) {
      alert("Thời gian làm bài không hợp lệ!");
      return;
    }

    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/teacher/create-test`, // dùng chung api, chỉ khác là không gửi classId lên
      {
        testName,
        timeLimit,
        questions,
        maxGrade,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
      alert("Tạo bài thi thành công!");
      setTestName("");
      setTimeLimit(30);
      setQuestions([
        {
          question: "",
          choices: ["", "", "", ""],
          correctAnswer: 0,
          type: "Grammar",
        },
      ]);
      setActiveIndex(0);
    } else {
      alert("Đã xảy ra lỗi khi tạo bài thi. Vui lòng thử lại sau.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">
        Tạo bài thi mới
      </h1>

      {/* Thông tin bài thi */}
      <div className="mb-6 space-y-4">
        <div>
          <Label className="block mb-1 font-medium dark:text-white">
            Tên bài thi
          </Label>
          <Input
            type="text"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
          />
        </div>
        <div>
          <Label className="block mb-1 font-medium dark:text-white">
            Thời gian làm bài (phút)
          </Label>
          <Input
            type="text"
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
          />
        </div>

        <div>
          <Label className="block mb-1 font-medium dark:text-white">
            Điểm tối đa
          </Label>
          <Input
            type="text"
            value={maxGrade}
            onChange={(e) => setMaxGrade(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Tabs điều hướng câu hỏi */}
      <div className="mb-6 border-b border-gray-300 dark:border-gray-600">
        <nav className="flex gap-2 overflow-x-auto">
          {questions.map((_, idx) => (
            <Button
              key={idx}
              className={`rounded-t-lg `}
              variant={activeIndex === idx ? "primary" : "outline"}
              onClick={() => setActiveIndex(idx)}
              aria-label={`Câu hỏi ${idx + 1}`}
            >
              Câu {idx + 1}
            </Button>
          ))}

          <Button
            onClick={addQuestion}
            aria-label="Thêm câu hỏi"
            variant="success"
          >
            + Thêm câu hỏi
          </Button>
        </nav>
      </div>

      {/* Nội dung câu hỏi đang chọn */}
      {questions.length > 0 && (
        <div className="mb-8 border border-gray-300 rounded p-6 dark:border-gray-600 dark:bg-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold dark:text-white">
              Câu hỏi {activeIndex + 1}
            </h2>

            <Button
              onClick={() => removeQuestion(activeIndex)}
              aria-label="Xóa câu hỏi"
              variant="error"
            >
              Xóa câu hỏi
            </Button>
          </div>
          <Label className="block mb-2 font-medium dark:text-white">
            Loại câu hỏi
          </Label>
          <Select
            options={questionType}
            placeholder="Chọn loại câu hỏi"
            className="mb-4"
            onChange={(value: string) =>
              updateQuestion(activeIndex, "type", value)
            }
          ></Select>
          {questions[activeIndex].type === "Grammar" && (
            <>
              <Label className="block mb-2 font-medium dark:text-white">
                Nội dung câu hỏi
              </Label>
              <textarea
                value={questions[activeIndex].question}
                onChange={(e) =>
                  updateQuestion(activeIndex, "question", e.target.value)
                }
                rows={3}
                className="w-full border border-gray-300 rounded px-3 py-2 mb-6 resize-none focus:outline-none focus:ring dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />

              <div>
                <Label className="block mb-2 font-medium dark:text-white">
                  Đáp án
                </Label>
                {questions[activeIndex].choices.map((choice, idx) => (
                  <Label
                    key={idx}
                    className="flex mb-3 space-x-3 dark:text-white"
                  >
                    <input
                      type="radio"
                      name={`correct-answer-${activeIndex}`}
                      checked={questions[activeIndex].correctAnswer === idx + 1}
                      onChange={() => updateCorrectAnswer(activeIndex, idx)}
                    />
                    <Input
                      type="text"
                      value={choice}
                      onChange={(e) =>
                        updateQuestion(
                          activeIndex,
                          "choice",
                          e.target.value,
                          idx
                        )
                      }
                      placeholder={`Đáp án ${String.fromCharCode(65 + idx)}`}
                      className="w-full"
                    />
                  </Label>
                ))}
              </div>
            </>
          )}
          {(questions[activeIndex].type === "Listening" ||
            questions[activeIndex].type === "Reading") && (
              <>
                <Label className="block mb-2 font-medium dark:text-white">
                  {questions[activeIndex].type === "Listening"
                    ? "Tải lên tệp âm thanh (MP3)"
                    : "Nội dung đoạn văn"}
                </Label>

                {questions[activeIndex].type === "Listening" ? (
                  <>
                    <FileInput
                      accept="audio/mp3"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          updateQuestion(activeIndex, "audio", file);
                        }
                      }}
                      className="mb-4"
                    />

                    {questions[activeIndex].audio && (
                      <audio controls className="w-full mt-4">
                        <source
                          src={questions[activeIndex].audio}
                          type="audio/mp3"
                        />
                        Trình duyệt của bạn không hỗ trợ phát âm thanh.
                      </audio>
                    )}
                  </>
                ) : (
                  <textarea
                    value={questions[activeIndex].question}
                    onChange={(e) =>
                      updateQuestion(activeIndex, "question", e.target.value)
                    }
                    rows={3}
                    className="w-full border border-gray-300 rounded px-3 py-2 mb-6 resize-none focus:outline-none focus:ring dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                )}

                <div className="mb-4">
                  <Label className="block mb-2 font-medium dark:text-white">
                    Danh sách câu hỏi con
                  </Label>
                  {questions[activeIndex].subQuestions?.map((sub, subIdx) => (
                    <div
                      key={subIdx}
                      className="mb-4 p-4 border rounded dark:border-gray-600"
                    >
                      <Label className="block mb-2 dark:text-white">
                        Câu hỏi con {subIdx + 1}
                      </Label>
                      <textarea
                        value={sub.question}
                        onChange={(e) =>
                          updateSubQuestion(
                            activeIndex,
                            subIdx,
                            "question",
                            e.target.value
                          )
                        }
                        rows={2}
                        className="w-full border border-gray-300 rounded px-3 py-2 mb-4 resize-none focus:outline-none focus:ring dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />

                      <Label className="block mb-2 dark:text-white">Đáp án</Label>
                      {sub.choices.map((choice, choiceIdx) => (
                        <Label
                          key={choiceIdx}
                          className="flex mb-2 space-x-2 dark:text-white"
                        >
                          <input
                            type="radio"
                            name={`correct-sub-answer-${activeIndex}-${subIdx}`}
                            checked={sub.correctAnswer === choiceIdx + 1}
                            onChange={() =>
                              updateCorrectSubAnswer(
                                activeIndex,
                                subIdx,
                                choiceIdx
                              )
                            }
                          />
                          <Input
                            type="text"
                            value={choice}
                            onChange={(e) =>
                              updateSubQuestion(
                                activeIndex,
                                subIdx,
                                "choice",
                                e.target.value,
                                choiceIdx
                              )
                            }
                            placeholder={`Đáp án ${String.fromCharCode(
                              65 + choiceIdx
                            )}`}
                            className="w-full"
                          />
                        </Label>
                      ))}
                    </div>
                  ))}

                  <Button
                    onClick={() => addSubQuestion(activeIndex)}
                    className="mt-2"
                    variant="outline"
                  >
                    Thêm câu hỏi con
                  </Button>
                </div>
              </>
            )}
        </div>
      )}

      {/* Nút submit */}
      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          variant="primary"
          className="px-10 py-3 text-lg"
        >
          Lưu bài thi
        </Button>
      </div>
    </div>
  );
}
