import ComponentCard from "../../components/common/ComponentCard";
import { CalenderIcon, TimeIcon, TrashBinIcon } from "../../icons";
import PageMeta from "../../components/common/PageMeta";
import { useState, useEffect, ChangeEvent } from "react";
import Label from "../../components/form/Label";
import Flatpickr from "react-flatpickr";
import SelectUsingReactSelect from "../../components/form/form-elements/ReactSelect";
import axios from "axios";
import Input from "../../components/form/input/InputField";
import Radio from "../../components/form/input/Radio";
import Alert from "../../components/ui/alert/Alert";
type Teacher = {
  _id: string;
  fullName: string;
};

export default function CreateClass() {
  const [className, setClassName] = useState<string>("");
  const [teachingLanguage, setTeachingLanguage] = useState<string>("");
  const [teacherList, setTeacherList] = useState<Teacher[] | null>([]);
  const [choosenTeacher, setChoosenTeacher] = useState<Teacher | null>(null);
  const [price, setPrice] = useState<number>();
  const [timeFrom, setTimeFrom] = useState<string>();
  const [timeTo, setTimeTo] = useState<string>();
  const [maxStudent, setMaxStudent] = useState<number>();
  const [classUrl, setClassUrl] = useState<string>("");
  const [dayForSingleClass, setDayForSingleClass] = useState<string>("");
  const [startDayForClassByWeeks, setStartDayForClassByWeeks] =
    useState<string>("");
  const [endDayForClassByWeeks, setEndDayForClassByWeeks] =
    useState<string>("");
  const [isError, setIsError] = useState<boolean | null>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);

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

  const dayOfWeekOptions = [
    { value: "Monday", label: "Thứ Hai" },
    { value: "Tuesday", label: "Thứ Ba" },
    { value: "Wednesday", label: "Thứ Tư" },
    { value: "Thursday", label: "Thứ Năm" },
    { value: "Friday", label: "Thứ Sáu" },
    { value: "Saturday", label: "Thứ Bảy" },
    { value: "Sunday", label: "Chủ Nhật" },
  ];

  const [classType, setClassType] = useState<string>("singleClass");
  const [priceType, setPriceType] = useState<string>("byDay");

  const handleClassTypeRadioChange = (value: string) => {
    setClassType(value);
  };

  const handlePriceTypeRadioChange = (value: string) => {
    setPriceType(value);
  };

  useEffect(() => {
    const fetchTeacherList = async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/admin/fetch-teacher-list`,
          { teachingLanguage },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        setTeacherList(response.data || []);
      } catch (error) {
        console.error("Failed to fetch teacher list:", error);
      }
    };

    fetchTeacherList();
  }, [teachingLanguage]);

  const [rows, setRows] = useState([
    { id: 1, dateOfWeek: "", timeFrom: "", timeTo: "" },
  ]);

  const addNewRow = () => {
    const newRow = {
      id: rows.length + 1,
      dateOfWeek: "",
      timeFrom: "",
      timeTo: "",
    };
    setRows([...rows, newRow]);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    rowId: number
  ) => {
    const { name, value } = e.target;
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === rowId ? { ...row, [name]: value } : row
      )
    );
  };

  const deleteRow = (rowId: number) => {
    setRows(rows.filter((row) => row.id !== rowId));
  };

  const createClass = async () => {
    let response;

    if (classType === "singleClass") {
      try {
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/admin/create-class`,
          {
            className,
            teachingLanguage,
            teacherName: choosenTeacher?.fullName,
            teacherId: choosenTeacher?._id,
            maxStudent,
            classUrl,
            classType: "singleClass",
            timeFrom,
            timeTo,
            schedule: dayForSingleClass,
            price,
            priceType,
          }
        );
        if (response.status === 200) {
          setIsError(false);
        } else {
          setIsError(true);
        }
      } catch (error) {
        console.error("Error creating single class:", error);
        setIsError(true);
      }
    }

    if (classType === "classByWeeks") {
      try {
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/admin/create-class`,
          {
            className,
            teachingLanguage,
            teacherName: choosenTeacher?.fullName,
            teacherId: choosenTeacher?._id,
            maxStudent,
            classUrl,
            classType: "classByWeeks",
            schedule: rows,
            startDayForClassByWeeks,
            endDayForClassByWeeks,
            price,
            priceType,
          }
        );
        if (response.status === 200) {
          setIsError(false);
        } else {
          setIsError(true);
        }
      } catch (error) {
        console.error("Error creating class by weeks:", error);
        setIsError(true);
      }
    }

    // Reset alert after 3 seconds
    setTimeout(() => {
      setIsError(null);
    }, 3000);
  };

  useEffect(() => {
    if (isError !== null) {
      setShowAlert(true);
      console.log("showAlert");
      const timer = setTimeout(() => setShowAlert(false), 3000); // hide after 3s
      return () => clearTimeout(timer); // cleanup
    }
  }, [isError]);

  return (
    <div>
      <PageMeta
        title="EzLearn Admin- Tạo lớp học"
        description="EzLearn Admin- Tạo lớp học"
      />
      {showAlert && (
        <div
          style={{
            position: "fixed",
            width: "100vw",
            zIndex: 100,
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          {isError === true && (
            <Alert
              variant="error"
              title="Thất bại"
              message="Tạo lớp học thất bại"
            />
          )}{" "}
          {isError === false && (
            <Alert
              variant="success"
              title="Thành công"
              message="Tạo lớp học thành công"
            />
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-1">
        <ComponentCard title="Tạo lớp học">
          <div className="col-span-2">
            <Label htmlFor="inputTwo">
              Tên lớp học <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              id="inputTwo"
              placeholder=""
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full dark:bg-dark-900"
            />
          </div>

          <div>
            <Label>
              Ngôn ngữ giảng dạy <span className="text-red-500">*</span>
            </Label>
            <SelectUsingReactSelect
              options={teachingLanguageOptions}
              placeholder="Ngôn ngữ giảng dạy"
              onChange={(option) => {
                setTeachingLanguage(option);
              }}
              className="dark:bg-dark-900"
              isSearchable={true}
            />
          </div>
          <div>
            <Label>
              Chỉ định giảng viên <span className="text-red-500">*</span>
            </Label>
            <SelectUsingReactSelect
              options={
                teacherList?.map((teacher) => ({
                  value: teacher._id,
                  label: `${teacher.fullName} - ID: ${teacher._id}`,
                })) || []
              }
              placeholder="Tìm kiếm"
              onChange={(option) =>
                setChoosenTeacher(
                  teacherList?.find((teacher) => teacher._id === option) || null
                )
              }
              className="dark:bg-dark-900"
              isSearchable={true}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-1">
            <div>
              <Label htmlFor="inputTwo">Số lượng học sinh</Label>
              <Input
                className="w-full"
                type="number"
                id="inputTwo"
                placeholder=""
                value={maxStudent}
                onChange={(e) =>
                  setMaxStudent(parseFloat(e.target.value) || undefined)
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="inputTwo">
              Link vào lớp <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              id="inputTwo"
              placeholder=""
              value={classUrl}
              onChange={(e) => setClassUrl(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div>
              <Label htmlFor="datePicker">
                Loại lớp <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center space-x-4">
                <Radio
                  id="radio1"
                  name="group1"
                  value="singleClass"
                  checked={classType === "singleClass"}
                  onChange={handleClassTypeRadioChange}
                  label="Lớp một buổi"
                />
                <Radio
                  id="radio2"
                  name="group1"
                  value="classByWeeks"
                  checked={classType === "classByWeeks"}
                  onChange={handleClassTypeRadioChange}
                  label="Lớp hàng tuần"
                />
              </div>
            </div>
          </div>
          {classType === "singleClass" && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div>
                <Label htmlFor="datePicker">
                  Chọn ngày <span className="text-red-500">*</span>
                </Label>
                <div className="relative w-full flatpickr-wrapper">
                  <Flatpickr
                    onChange={(dates) =>
                      setDayForSingleClass(
                        dates[0]?.toLocaleDateString("en-GB")
                      )
                    }
                    options={{
                      dateFormat: "d-m-Y",
                    }}
                    placeholder="Ngày giảng dạy"
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700  dark:focus:border-brand-800"
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <CalenderIcon className="size-6" />
                  </span>
                </div>
              </div>
              <div>
                <Label htmlFor="tm">
                  Giờ vào học <span className="text-red-500">*</span>
                </Label>
                <div
                  className="relative"
                  onFocus={(e) =>
                    (e.target as HTMLDivElement)
                      .querySelector("input")
                      ?.showPicker()
                  }
                >
                  <Input
                    type="time"
                    id="tm"
                    name="tm"
                    onChange={(e) => setTimeFrom(e.target.value)}
                    className="w-full"
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400 z-10">
                    <TimeIcon />
                  </span>
                </div>
              </div>
              <div>
                <Label htmlFor="tm">
                  Giờ tan học <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <div
                    className="relative"
                    onFocus={(e) =>
                      (e.target as HTMLDivElement)
                        .querySelector("input")
                        ?.showPicker()
                    }
                  >
                    <Input
                      type="time"
                      id="tm"
                      name="tm"
                      onChange={(e) => setTimeTo(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400 z-10">
                    <TimeIcon />
                  </span>
                </div>
              </div>
            </div>
          )}
          {classType === "classByWeeks" && (
            <div>
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-1 gap-6 xl:grid-cols-4 pt-3"
                >
                  <div>
                    <Label>
                      Ngày <span className="text-red-500">*</span>
                    </Label>
                    <SelectUsingReactSelect
                      options={dayOfWeekOptions} // assuming dayOfWeekOptions is an array of { value, label }
                      placeholder="Thứ"
                      onChange={(option) => {
                        console.log(option);
                        handleInputChange(
                          {
                            target: { name: "dateOfWeek", value: option },
                          } as ChangeEvent<HTMLInputElement>,
                          row.id
                        );
                      }}
                      className="dark:bg-dark-900"
                      isSearchable={true}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`timeFrom-${row.id}`}>
                      Giờ vào học <span className="text-red-500">*</span>
                    </Label>
                    <div
                      className="relative"
                      onFocus={(e) =>
                        (e.target as HTMLDivElement)
                          .querySelector("input")
                          ?.showPicker()
                      }
                    >
                      <Input
                        type="time"
                        id={`timeFrom-${row.id}`}
                        name="timeFrom"
                        value={row.timeFrom}
                        onChange={(e) => handleInputChange(e, row.id)}
                        className="w-full"
                      />
                      <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400 z-10">
                        <TimeIcon />
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`timeTo-${row.id}`}>
                      Giờ tan học <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type="time"
                        id={`timeTo-${row.id}`}
                        name="timeTo"
                        value={row.timeTo}
                        onChange={(e) => handleInputChange(e, row.id)}
                        className="w-full"
                      />
                      <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400 z-10">
                        <TimeIcon />
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => deleteRow(row.id)}
                      className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
                    >
                      <TrashBinIcon />
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addNewRow}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
              >
                Thêm buổi
              </button>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 pt-3">
                <div>
                  <Label htmlFor="datePicker">
                    Ngày bắt đầu <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative w-full flatpickr-wrapper">
                    <Flatpickr
                      options={{
                        dateFormat: "d-m-Y",
                      }}
                      onChange={(dates) =>
                        setStartDayForClassByWeeks(
                          dates[0]?.toLocaleDateString("en-GB")
                        )
                      }
                      placeholder="Ngày bắt đầu"
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <CalenderIcon className="size-6" />
                    </span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="datePicker">
                    Ngày kết thúc <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative w-full flatpickr-wrapper">
                    <Flatpickr
                      options={{
                        dateFormat: "d-m-Y",
                      }}
                      onChange={(dates) =>
                        setEndDayForClassByWeeks(
                          dates[0]?.toLocaleDateString("en-GB")
                        )
                      }
                      placeholder="Ngày kết thúc"
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <CalenderIcon className="size-6" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-1">
            <div>
              <Label htmlFor="inputTwo">
                Học phí <span className="text-red-500">*</span>
              </Label>
              <Input
                className="w-full"
                type="number"
                id="inputTwo"
                placeholder="đ"
                value={price}
                onChange={(e) =>
                  setPrice(parseFloat(e.target.value) || undefined)
                }
              />
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div>
                  <div className="flex items-center space-x-4 pt-3">
                    <Radio
                      id="price1"
                      name="price1"
                      value="byCourse"
                      checked={priceType === "byCourse"}
                      onChange={handlePriceTypeRadioChange}
                      label="Tính theo khóa học"
                    />
                    <Radio
                      id="price2"
                      name="price2"
                      value="byDay"
                      checked={priceType === "byDay"}
                      onChange={handlePriceTypeRadioChange}
                      label="Tính theo buổi"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={() => createClass()}
              className="px-6 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
            >
              Tạo lớp học
            </button>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
