import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/ApplicationFormTable";

export default function ApplicationForms() {
  return (
    <>
      <PageMeta
        title="EzLearn - Đơn đăng ký giảng dạy"
        description="Đơn đăng ký giảng dạy"
      />
      <PageBreadcrumb pageTitle="Đơn đăng ký giảng dạy" />
      <div className="space-y-6">
        <ComponentCard title="Danh sách đơn">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </>
  );
}
