import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

import Badge from "../../ui/badge/Badge";
import { constants } from "../../../constant";
import axios from "axios";
import moment from "moment";
import { useModal } from "../../../hooks/useModal";
import { Modal } from "../../ui/modal";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import Button from "../../ui/button/Button";
import Select from "../../form/Select";

interface ApplicationForm {
  _id: string;
  userId: string;
  fullName: string;
  CV: string;
  languageSkills: string;
  teachingLanguage: string[];
  teachingCommitment:
    | typeof constants.commitment.fulltime
    | typeof constants.commitment.parttime;
  status:
    | typeof constants.applicationStatus.pending
    | typeof constants.applicationStatus.approved
    | typeof constants.applicationStatus.rejected; // "Pending" | "Approved" | "Rejected"
  approvedAt: Date | null;
  createdAt: Date;
}

const fetchApllicationForm = async ({
  filterStatus = constants.applicationStatus.all,
  page = 1,
  itemPerPage = 10,
}) => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_URL}/admin/fetch-application-forms`,
    {
      page,
      itemPerPage,
      filterStatus,
    },
    {
      headers: {
        "Content-Type": "application/json", // Set the correct content type
      },
    }
  );

  const applicationForms = response.data;
  return applicationForms;
};

const updateApplicationFormStatus = async ({
  updateStatus,
  applicationFormId,
}: {
  updateStatus: ApplicationForm["status"];
  applicationFormId: string;
}) => {
  await axios.post(
    `${import.meta.env.VITE_API_URL}/admin//update-application-form-status`,
    {
      updateStatus,
      applicationFormId,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export default function ApplicationFormTable() {
  const statusOptions = [
    { value: "Pending", label: "Chờ phê duyệt" },
    { value: "Approved", label: "Chấp nhận" },
    { value: "Rejected", label: "Từ chối" },
  ];

  const statusByVietnamese: Record<ApplicationForm["status"], string> = {
    Pending: "Chờ xét duyệt",
    Approved: "Đã chấp nhận",
    Rejected: "Đã từ chối",
  };

  const [applicationForms, setApplicationForms] = React.useState<
    ApplicationForm[]
  >([]);
  const [rowsPerPage] = React.useState<number>(10);
  const [page] = React.useState<number>(1);
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedApplicationForm, setSelectedApplicationForm] =
    React.useState<ApplicationForm>();

  const [filteredApplicationForm, setFilteredApplicationForm] = React.useState<
    ApplicationForm[]
  >([]);

  const handleSave = async () => {
    await updateApplicationFormStatus({
      updateStatus: selectedApplicationForm?.status || "Pending",
      applicationFormId: selectedApplicationForm?._id || "",
    });
    closeModal();
  };

  const openEditApplication = (applicationForm: ApplicationForm) => {
    setSelectedApplicationForm(applicationForm);
    openModal();
  };

  const handleStatusSelectChange = (value: string) => {
    if (selectedApplicationForm) {
      selectedApplicationForm.status = value as ApplicationForm["status"];
      setSelectedApplicationForm({ ...selectedApplicationForm });
    }
  };

  const handleSearchBarChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const searchValue = event.target.value.toLowerCase();
    const filteredApplicationForms = applicationForms.filter((form) =>
      form.fullName.toLowerCase().includes(searchValue)
    );
    setFilteredApplicationForm(filteredApplicationForms);
  };

  React.useEffect(() => {
    const fetchData = async () => {
      const data = await fetchApllicationForm({
        itemPerPage: rowsPerPage,
        page,
      }); // Await API call
      setApplicationForms(data);
      setFilteredApplicationForm(data);
    };

    fetchData();
  }, [rowsPerPage, page]); // Dependency array inside useEffect

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="px-5 py-3 mb-4">
        <div className="flex justify-between items-center">
          <div className="relative w-full max-w-xs flex items-center">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên ứng viên ..."
              onChange={handleSearchBarChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-white/[0.03] dark:border-white/[0.1] dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="fill-current absolute left-3 text-gray-500 dark:text-gray-400"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                d="M21 21l-4.35-4.35M16 10a6 6 0 11-12 0 6 6 0 0112 0z"
              />
            </svg>
          </div>
          <div className="relative w-full max-w-xs flex items-center">
            <Select
              options={[
                { value: constants.applicationStatus.all, label: "Tất cả" },
                {
                  value: constants.applicationStatus.pending,
                  label: "Chờ phê duyệt",
                },
                {
                  value: constants.applicationStatus.approved,
                  label: "Chấp nhận",
                },
                {
                  value: constants.applicationStatus.rejected,
                  label: "Từ chối",
                },
              ]}
              placeholder="Lọc theo trạng thái"
              defaultValue={constants.applicationStatus.all}
              onChange={(option) => {
                const filteredForms = applicationForms.filter(
                  (form) =>
                    option === constants.applicationStatus.all ||
                    form.status === option
                );
                setFilteredApplicationForm(filteredForms);
              }}
              className="w-full pl-3 pr-4 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-white/[0.03] dark:border-white/[0.1] dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Họ và tên
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Ngôn ngữ giảng dạy
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Loại hợp đồng
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Ngày nộp đơn
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Trạng thái
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {filteredApplicationForm?.map(
                (applicationForm: ApplicationForm) => (
                  <TableRow key={applicationForm._id}>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {applicationForm.fullName}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {applicationForm.teachingLanguage.join(", ")}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {applicationForm.teachingCommitment}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {moment(applicationForm.createdAt).format("DD/MM/YYYY")}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge
                        size="sm"
                        color={
                          applicationForm.status === "Approved"
                            ? "success"
                            : applicationForm.status === "Pending"
                            ? "warning"
                            : "error"
                        }
                      >
                        {applicationForm.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => openEditApplication(applicationForm)}
                        className="flex w-80% items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
                      >
                        <svg
                          className="fill-current"
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                            fill=""
                          />
                        </svg>
                        Edit
                      </button>
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
          <Modal
            isOpen={isOpen}
            onClose={closeModal}
            className="max-w-[700px] m-4"
          >
            <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
              <div className="px-2 pr-14">
                <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                  Chi tiết đơn đăng ký
                </h4>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                  Hợp tác với những ứng viên đầy triển vọng !{" "}
                </p>
              </div>
              <form className="flex flex-col">
                <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                  <div>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                      <div>
                        <Label>Họ và tên</Label>
                        <Input
                          type="text"
                          className="bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-400 disabled:opacity-100 disabled:cursor-not-allowed"
                          disabled
                          value={selectedApplicationForm?.fullName}
                        />
                      </div>

                      <div>
                        <Label>Loại hợp đồng</Label>
                        <Input
                          type="text"
                          className="bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-400 disabled:opacity-100 disabled:cursor-not-allowed"
                          disabled
                          value={selectedApplicationForm?.teachingCommitment}
                        />
                      </div>

                      <div>
                        <Label>Kỹ năng ngoại ngữ</Label>
                        <Input
                          className="bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-400 disabled:opacity-100 disabled:cursor-not-allowed"
                          disabled
                          value={selectedApplicationForm?.languageSkills}
                        />
                      </div>
                      <div>
                        <Label>Ngày đăng ký</Label>
                        <Input
                          type="text"
                          className="bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-400 disabled:opacity-100 disabled:cursor-not-allowed"
                          disabled
                          value={moment(
                            selectedApplicationForm?.createdAt
                          ).format("DD/MM/YYYY")}
                        />
                      </div>
                      <div>
                        <Label>Hồ sơ</Label>
                        <a
                          href={selectedApplicationForm?.CV}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-400 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {selectedApplicationForm?.CV.slice(0, 34) + "..."}
                        </a>
                      </div>
                      <div>
                        <Label>Trạng thái</Label>
                        <Select
                          options={statusOptions}
                          placeholder={
                            statusByVietnamese[
                              selectedApplicationForm?.status || "Pending"
                            ] ?? "Chưa có trạng thái"
                          }
                          onChange={(option) =>
                            handleStatusSelectChange(option)
                          } // Truyền đối tượng đúng vào hàm
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                  <Button size="sm" variant="outline" onClick={closeModal}>
                    Close
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
}
