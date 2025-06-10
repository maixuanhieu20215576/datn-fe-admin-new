import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import ApplicationForms from "./pages/Forms/ApplicationForms";
import CreateClass from "./pages/Class/CreateClass";
import ClassManagement from "./pages/Class/ClassManagement";
import ClassDetail from "./pages/Class/ClassDetail";
import { useState } from "react";
import PaymentManagement from "./pages/TeacherManagement.tsx/PaymentMangement";
import Chat from "./pages/Chat";
import CreateCourse from "./pages/CourseManagement/CreateCourse";
import CreateTest from "./pages/TestManagement/CreateTest";
import Course from "./pages/Course";
import YourCourseDetail from "./pages/YourCourseDetail";
import UnitPage from "./components/UnitDetail";

export default function App() {
  const [userId, setUserId] = useState(() => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user)._id : null;
  });
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route
            element={userId ? <AppLayout /> : <SignIn setUserId={setUserId} />}
          >
            <Route index path="/" element={<Home />} />
            <Route path="/course" element={<Course />} />
            <Route
              path="/your-course/:courseId"
              element={<YourCourseDetail />}
            />
            <Route
              path="/your-course/:id/unit/:unitId"
              element={<UnitPage />}
            />
            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />
            <Route path="/application-forms" element={<ApplicationForms />} />
            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />

            <Route path="/create-class" element={<CreateClass />} />
            <Route path="/class-management" element={<ClassManagement />} />
            <Route path="/class-detail/:classId" element={<ClassDetail />} />
            <Route path="/payment-management" element={<PaymentManagement />} />
            <Route path="/create-course" element={<CreateCourse />} />
            <Route path="/chat" element={<Chat />} />

            <Route path="/create-test" element={<CreateTest />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn setUserId={setUserId} />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
