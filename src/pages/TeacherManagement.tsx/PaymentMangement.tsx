import PageMeta from "../../components/common/PageMeta";

import PageBreadcrumb from "../../components/common/PageBreadCrumb";

import ComponentCard from "../../components/common/ComponentCard";
import { TableBody, TableHeader } from "../../components/ui/table";
import { TableRow } from "../../components/ui/table";
import { TableCell } from "../../components/ui/table";
import React, { useState, useEffect } from "react";

import axios from "axios";
import Input from "../../components/form/input/InputField";
import { Table } from "../../components/ui/table";
import Select from "../../components/form/Select";
import Badge from "../../components/ui/badge/Badge";
import {
  formatNumber,
  getUserIdFromLocalStorage,
  getUserNameFromLocalStorage,
  useAccessToken,
} from "../../components/common/utils";
import Button from "../../components/ui/button/Button";
interface TeacherSalary {
  id: string;
  teacherId: {
    _id: string;
    avatar: string;
    fullName: string;
  };
  status: string;
  salary: number;
  month: number;
  year: number;
}

export default function PaymentManagement() {
  const userId = getUserIdFromLocalStorage();
  const paymentByAdminName = getUserNameFromLocalStorage();
  const [qrImageUrl, setQrImageUrl] = useState<string>("");
  const [showPopup, setShowPopup] = useState(false);

  const statusOptions = [
    { value: "paid", label: "Đã thanh toán" },
    { value: "unpaid", label: "Chưa thanh toán" },
  ];

  const [teachers, setTeachers] = useState<TeacherSalary[]>([]);
  const [currentPaymentTeacher, setCurrentPaymentTeacher] =
    useState<TeacherSalary | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const token = useAccessToken();

  const fetchTeachers = async () => {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/admin/get-teachers-salary`,
      {
        searchTerm,
        filterStatus,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setTeachers(response.data);
  };
  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (value: string) => {
    setFilterStatus(value);
  };

  const handleSearch = () => {
    fetchTeachers();
  };

  const handlePaySalary = async (
    id: string,
    salary: number,
    month: number,
    year: number,
    teacher: TeacherSalary
  ) => {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/admin/get-vietqr-payment`,
      {
        teacherId: id,
        amount: salary,
        month,
        year,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setQrImageUrl(response.data);
    setCurrentPaymentTeacher(teacher);
    setShowPopup(true);
  };

  const paymentComplete = async () => {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/admin/salary-payment-complete`,
      {
        paymentByAdminId: userId,
        teacherId: currentPaymentTeacher?.teacherId._id,
        month: currentPaymentTeacher?.month,
        year: currentPaymentTeacher?.year,
        paymentByAdminName,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setShowPopup(false);
    setCurrentPaymentTeacher(null);
    fetchTeachers();
  };

  return (
    <>
      <PageMeta
        title="EzLearn - Thanh toán lương"
        description="Thanh toán lương"
      />
      <PageBreadcrumb pageTitle="Thanh toán lương" />
      <div className="space-y-6">
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Tìm kiếm tên giảng viên"
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full"
          />
          <Select
            options={statusOptions}
            placeholder="Lọc theo trạng thái"
            onChange={handleFilterChange}
            className="w-1/5"
          />
          <Button variant="primary" className="w-1/6" onClick={handleSearch}>
            Tìm kiếm
          </Button>
        </div>
        <ComponentCard title="Danh sách thanh toán lương">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell className="text-center text-gray-500 dark:text-gray-400">
                  Tên giảng viên
                </TableCell>
                <TableCell className="text-center text-gray-500 dark:text-gray-400">
                  Lương
                </TableCell>
                <TableCell className="text-center text-gray-500 dark:text-gray-400">
                  Trạng thái thanh toán
                </TableCell>
                <TableCell className="text-center text-gray-500 dark:text-gray-400">
                  Tháng
                </TableCell>
                <TableCell className="text-center text-gray-500 dark:text-gray-400">
                  Hành động
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center text-gray-500 dark:text-gray-400 py-4">
                    Không có bản ghi thỏa mãn bộ lọc
                  </TableCell>
                </TableRow>
              ) : (
                teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="flex items-center gap-2 text-center text-gray-500 dark:text-gray-400 py-1">
                      {" "}
                      <img
                        src={teacher.teacherId?.avatar}
                        alt={teacher.teacherId?.fullName}
                        className="w-10 h-10 rounded-full p-1"
                      />
                      {teacher.teacherId?.fullName}
                    </TableCell>
                    <TableCell className="text-center text-gray-500 dark:text-gray-400">
                      {formatNumber(teacher.salary)}
                    </TableCell>
                    <TableCell className="text-center text-gray-500 dark:text-gray-400">
                      <Badge
                        color={teacher.status === "paid" ? "success" : "error"}
                      >
                        {teacher.status === "paid"
                          ? "Đã thanh toán"
                          : "Chưa thanh toán"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-gray-500 dark:text-gray-400">
                      {teacher.month}/{teacher.year}
                    </TableCell>
                    <TableCell className="text-center text-gray-500 dark:text-gray-400">
                      {teacher.status === "unpaid" && (
                        <Button
                          disabled={teacher.month >= new Date().getMonth() + 1}
                          variant="primary"
                          className="w-2/3 h-10"
                          onClick={() =>
                            handlePaySalary(
                              teacher.teacherId._id,
                              teacher.salary,
                              teacher.month,
                              teacher.year,
                              teacher
                            )
                          }
                        >
                          Thanh toán
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ComponentCard>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black/10 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Quét mã QR để thanh toán
              </h3>
              <button
                onClick={() => setShowPopup(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <img src={qrImageUrl} alt="QR Code" className="w-64 h-64" />
            </div>
            <Button
              variant="primary"
              className="w-full h-10"
              onClick={() => paymentComplete()}
            >
              Hoàn thành
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
