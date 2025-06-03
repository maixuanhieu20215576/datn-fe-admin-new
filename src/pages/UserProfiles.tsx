import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import PageMeta from "../components/common/PageMeta";

export default function UserProfiles() {
  return (
    <>
      <PageMeta
        title="EzLearn - Chỉnh sửa hồ sơ"
        description="EzLearn - Chỉnh sửa hồ sơ"
      />
      <PageBreadcrumb pageTitle="Chỉnh sửa hồ sơ" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Hồ sơ
        </h3>
        <div className="space-y-6">
          <UserMetaCard />
          {/* <UserInfoCard /> */}
          {/* <UserAddressCard /> */}
        </div>
      </div>
    </>
  );
}
