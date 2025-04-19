import { useState } from "react";
import Button from "../../components/ui/button/Button";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import FileInput from "../../components/form/input/FileInput";
import { PlusIcon, TrashBinIcon } from "../../icons";
import SelectUsingReactSelect from "../../components/form/form-elements/ReactSelect";
import axios from "axios";
type Unit = {
  title: string;
  overview: string;
  file: File | null;
  fileUrl?: string | null;
};

type Lecture = {
  name: string;
  units: Unit[];
};

export default function CreateCourse() {
  const [courseName, setCourseName] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [instructor, setInstructor] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [language, setLanguage] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const [lectures, setLectures] = useState<Lecture[]>([]);

  const teachingLanguageOptions = [
    { value: "English", label: "Tiếng Anh" },
    { value: "Japanese", label: "Tiếng Nhật" },
    { value: "Chinese", label: "Tiếng Trung" },
    { value: "Korean", label: "Tiếng Hàn" },
    { value: "Thai", label: "Tiếng Thái" },
    { value: "Spanish", label: "Tiếng Tây Ban Nha" },
    { value: "German", label: "Tiếng Đức" },
    { value: "Arabic", label: "Tiếng Ả Rập" },
    { value: "Polish", label: "Tiếng Ba Lan" },
    { value: "French", label: "Tiếng Pháp" },
  ];

  const addLecture = () => {
    setLectures([...lectures, { name: "", units: [] }]);
  };

  const removeLecture = (index: number) => {
    const updatedLectures = [...lectures];
    updatedLectures.splice(index, 1);
    setLectures(updatedLectures);
  };

  const updateLectureName = (index: number, value: string) => {
    const updatedLectures = [...lectures];
    updatedLectures[index].name = value;
    setLectures(updatedLectures);
  };

  const addUnit = (lectureIndex: number) => {
    const updatedLectures = [...lectures];
    updatedLectures[lectureIndex].units.push({
      title: "",
      overview: "",
      file: null,
    });
    setLectures(updatedLectures);
  };

  const removeUnit = (lectureIndex: number, unitIndex: number) => {
    const updatedLectures = [...lectures];
    updatedLectures[lectureIndex].units.splice(unitIndex, 1);
    setLectures(updatedLectures);
  };

  const updateUnitOverview = (
    lectureIndex: number,
    unitIndex: number,
    value: string
  ) => {
    const updatedLectures = [...lectures];
    updatedLectures[lectureIndex].units[unitIndex].overview = value;
    setLectures(updatedLectures);
  };

  const updateUnitFile = (
    lectureIndex: number,
    unitIndex: number,
    file: File | null
  ) => {
    const updatedLectures = [...lectures];
    updatedLectures[lectureIndex].units[unitIndex].file = file;
    setLectures(updatedLectures);
  };

  const updateUnitTitle = (
    lectureIndex: number,
    unitIndex: number,
    value: string
  ) => {
    const updatedLectures = [...lectures];
    updatedLectures[lectureIndex].units[unitIndex].title = value;
    setLectures(updatedLectures);
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      console.log(thumbnail);
      formData.append("courseName", courseName);
      formData.append("instructor", instructor);
      formData.append("originalPrice", originalPrice);
      formData.append("discountedPrice", discountedPrice);
      formData.append("language", language);

      if (thumbnail) {
        formData.append("thumbnail", thumbnail);
      }

      const lecturesData = lectures.map((lecture, lectureIndex) => {
        return {
          name: lecture.name,
          units: lecture.units.map((unit, unitIndex) => {
            return {
              title: unit.title,
              overview: unit.overview,
              fileFieldName: `file-${lectureIndex}-${unitIndex}`,
            };
          }),
        };
      });

      formData.append("lectures", JSON.stringify(lecturesData));

      // Append từng file vào FormData
      lectures.forEach((lecture, lectureIndex) => {
        lecture.units.forEach((unit, unitIndex) => {
          if (unit.file) {
            const fieldName = `file-${lectureIndex}-${unitIndex}`;
            formData.append(fieldName, unit.file);
          }
        });
      });

      // Gửi về backend
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/course/create-course`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ Khóa học đã được tạo:", response.data);
      alert("Tạo khóa học thành công!");
    } catch (error) {
      console.error("❌ Lỗi khi tạo khóa học:", error);
      alert("Đã xảy ra lỗi khi tạo khóa học!");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-4 dark:text-gray-200">
        Tạo khóa học mới
      </h1>

      <ComponentCard title="Thông tin khóa học" className="space-y-4">
        <Input
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          placeholder="Tên khóa học"
        />

        <FileInput
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files ? e.target.files[0] : null;
            setThumbnail(file);
            if (file) {
              setThumbnailPreview(URL.createObjectURL(file));
            } else {
              setThumbnailPreview(null);
            }
          }}
        />

        {thumbnailPreview && (
          <div className="mt-2">
            <img
              src={thumbnailPreview}
              alt="Thumbnail Preview"
              className="w-48 h-32 object-cover rounded border"
            />
          </div>
        )}

        <Input
          value={instructor}
          onChange={(e) => setInstructor(e.target.value)}
          placeholder="Tên tác giả"
        />

        <div className="flex gap-4">
          <Input
            type="number"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            placeholder="Giá gốc (VNĐ)"
          />
          <Input
            type="number"
            value={discountedPrice}
            onChange={(e) => setDiscountedPrice(e.target.value)}
            placeholder="Giá sau giảm (VNĐ)"
          />
        </div>

        <SelectUsingReactSelect
          options={teachingLanguageOptions}
          placeholder="Ngôn ngữ giảng dạy"
          onChange={(option) => {
            setLanguage(option);
          }}
          className="dark:bg-dark-900"
          isSearchable={true}
        />
      </ComponentCard>

      {lectures.map((lecture, lectureIndex) => (
        <ComponentCard
          key={lectureIndex}
          title={`Chương ${lectureIndex + 1}`}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <Input
              value={lecture.name}
              onChange={(e) => updateLectureName(lectureIndex, e.target.value)}
              placeholder={`Tên chương ${lectureIndex + 1}`}
            />
            <Button
              variant="primary"
              onClick={() => removeLecture(lectureIndex)}
            >
              <TrashBinIcon />
            </Button>
          </div>

          {lecture.units.map((unit, unitIndex) => (
            <ComponentCard
              key={unitIndex}
              title={`Bài ${unitIndex + 1}`}
              className="bg-gray-50"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold dark:text-gray-200">Tên bài học</p>
                <Input
                  value={unit.title}
                  onChange={(e) =>
                    updateUnitTitle(lectureIndex, unitIndex, e.target.value)
                  }
                  placeholder="Nhập tên bài học"
                  className="mb-2"
                />
              </div>
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold dark:text-gray-200">Tổng quan</p>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => removeUnit(lectureIndex, unitIndex)}
                >
                  <TrashBinIcon />
                </Button>
              </div>

              <TextArea
                value={unit.overview}
                onChange={(value) =>
                  updateUnitOverview(lectureIndex, unitIndex, value)
                }
                placeholder="Nội dung tổng quan"
                className=""
                rows={4}
              />
              <p className="font-semibold dark:text-gray-200">Bài giảng</p>
              <FileInput
                onChange={(e) =>
                  updateUnitFile(
                    lectureIndex,
                    unitIndex,
                    e.target.files ? e.target.files[0] : null
                  )
                }
                accept="video/*,application/pdf"
              />
            </ComponentCard>
          ))}
          <Button onClick={() => addUnit(lectureIndex)} size="sm">
            + Thêm bài
          </Button>
        </ComponentCard>
      ))}
      <Button onClick={addLecture} className="flex items-center gap-2">
        <PlusIcon /> Thêm chương
      </Button>
      <Button onClick={handleSubmit} className="w-full py-4 text-lg">
        Tạo Khóa Học
      </Button>
    </div>
  );
}
