import axios from "axios";
import { useState, useEffect, SetStateAction } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { getUserIdFromLocalStorage, useAccessToken } from "./common/utils";
import ReactPlayer from "react-player";
import Button from "./ui/button/Button";
import { PencilIcon } from "../icons";
import FileInput from "./form/input/FileInput";

interface UnitContent {
  title: string;
  overview: string;
  fileUrl: string;
  lectureType: "mp4" | "pdf";
}

export default function UnitPage() {
  const token = useAccessToken();

  const navigate = useNavigate();
  const { unitId, id } = useParams();
  const [currentUnitId, setCurrentUnitId] = useState<string | undefined>(
    unitId
  );
  const [content, setContent] = useState<UnitContent | undefined>(undefined);
  const [parentUnit, setParentUnit] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"overview" | "lecture">(
    "overview"
  );
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false);
  const [nextLectureId, setNextLectureId] = useState<string | undefined>(
    undefined
  );
  const [lastLectureId, setLastLectureId] = useState<string | undefined>(
    undefined
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editedOverview, setEditedOverview] = useState<string | undefined>(
    content?.overview
  );
  const userId = getUserIdFromLocalStorage();

  const [fileInput, setFileInput] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState(content?.fileUrl);
  const [fileType, setFileType] = useState<string | undefined>(undefined);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      setFileInput(file);
      const fileUrl = URL.createObjectURL(file);
      setFileUrl(fileUrl);
      setFileType(file.type.split("/")[0]);
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();

    if (unitId) formData.append("unitId", unitId);
    if (id) formData.append("courseId", id);
    if (fileInput) formData.append("fileInput", fileInput);
    if (editedOverview) formData.append("overview", editedOverview);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/course/edit-course`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Cập nhật thành công");

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      alert("Cập nhật thất bại, vui lòng thử lại");
    }
  };

  useEffect(() => {
    const fetchUnitContent = async () => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/course/get-unit-content`,
        {
          lectureId: currentUnitId,
          courseId: id,
          userId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setContent(response.data.lectureContent);
      setParentUnit(response.data.parentUnit);
      setNextLectureId(response.data.nextLectureId);
      setLastLectureId(response.data.lastLectureId);
      setEditedOverview(response.data.lectureContent.overview);
      setFileUrl(response.data.lectureContent.fileUrl);
      setFileType(response.data.lectureContent.lectureType);
    };
    fetchUnitContent();
  }, [unitId, token, id, userId, currentUnitId]);

  const handleTabChange = (tab: "overview" | "lecture") => {
    setActiveTab(tab);
    if (tab === "lecture") {
      setIsPdfLoading(true);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedOverview(content?.overview);
  };

  const handleOverviewChange = async (e: {
    target: { value: SetStateAction<string | undefined> };
  }) => {
    setEditedOverview(e.target.value);
  };

  const handleOverviewSave = async () => {
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Title */}
      <div className="flex items-center text-xl mb-2 space-x-2 dark:text-white">
        <Link
          to={`/your-course/${id}`}
          className="hover:none text-gray-900 dark:text-white"
        >
          Khóa học
        </Link>
        <span>›</span>
        <span>{parentUnit}</span>
        <span>›</span>
        <span className="text-blue-500 dark:text-blue-500 font-bold">
          {content?.title}
        </span>
      </div>

      {/* Tab Buttons */}
      <div className="flex space-x-4 my-6">
        <Button
          className={`px-4 py-2 rounded ${
            activeTab === "overview"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 dark:bg-gray-700 dark:text-white"
          }`}
          onClick={() => handleTabChange("overview")}
        >
          Tổng quan
        </Button>
        <Button
          className={`px-4 py-2 rounded ${
            activeTab === "lecture"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 dark:bg-gray-700 dark:text-white"
          }`}
          onClick={() => handleTabChange("lecture")}
        >
          Bài giảng
        </Button>
      </div>

      {/* Content */}
      {activeTab === "overview" && content && (
        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 flex items-center justify-between">
          {/* Hiển thị nội dung hoặc trường nhập liệu nếu đang chỉnh sửa */}
          {isEditing ? (
            <div className="flex-1">
              <textarea
                value={editedOverview}
                onChange={handleOverviewChange}
                className="w-full border border-gray-300 p-2 rounded-lg dark:bg-gray-800 dark:text-white"
                rows={4}
              />
            </div>
          ) : (
            <div className="flex-1">{editedOverview}</div>
          )}

          {/* Nút chỉnh sửa */}
          <div>
            {isEditing ? (
              <>
                <Button
                  onClick={handleOverviewSave}
                  variant="primary"
                  className="ml-2"
                >
                  Lưu
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="ml-2"
                >
                  Hủy
                </Button>
              </>
            ) : (
              <Button onClick={handleEdit} variant="warning">
                <PencilIcon></PencilIcon>{" "}
              </Button>
            )}
          </div>
        </div>
      )}

      {activeTab === "lecture" && (
        <>
          {" "}
          <div className="relative w-full h-[800px] flex justify-center items-center">
            {/* Loading Spinner */}
            {fileType === "pdf" && isPdfLoading && (
              <div className="absolute top-10 left-1/2 transform -translate-x-1/2 z-10">
                <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
              </div>
            )}

            {/* PDF Viewer */}
            {(fileType === "pdf" || fileType === "application") && (
              <object
                data={fileUrl}
                type="application/pdf"
                width="100%"
                height="800px"
                onLoad={() => setIsPdfLoading(false)}
              >
                <p>PDF không load được.</p>
              </object>
            )}

            {(fileType === "mp4" || fileType === "video") && (
              <ReactPlayer
                width="100%"
                height="800px"
                controls
                url={fileUrl}
                progressInterval={1000}
              />
            )}
          </div>
          <FileInput
            onChange={handleFileChange}
            className="mt-5"
            accept=".pdf, .mp4"
          />
        </>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-8">
        {/* Bài trước */}
        <Button
          onClick={() => {
            navigate(`/your-course/${id}/unit/${lastLectureId}`);
            setCurrentUnitId(lastLectureId);
          }}
          disabled={lastLectureId === ""}
        >
          Bài trước
        </Button>

        <Button variant="success" onClick={handleSubmit}>
          {" "}
          Lưu thay đổi{" "}
        </Button>
        <Button
          onClick={() => {
            navigate(`/your-course/${id}/unit/${nextLectureId}`);
            setCurrentUnitId(nextLectureId);
          }}
          disabled={nextLectureId === ""}
        >
          Bài sau
        </Button>
      </div>
    </div>
  );
}
