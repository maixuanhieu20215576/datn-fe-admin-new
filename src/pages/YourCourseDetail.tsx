// src/App.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";

import axios from "axios";
import {
  ChevronDownIcon,
  ChevronUpIcon,
} from "../icons";
import Button from "../components/ui/button/Button";
import {
  getUserIdFromLocalStorage,
  useAccessToken,
} from "../components/common/utils";
import Pagination from "../components/ui/pagination/Pagination";
interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
}

interface Course {
  course_name: string;
  lectures: [
    {
      name: string;
      units: [
        {
          _id: string;
          title: string;
          overview: string;
          fileUrl: string;
        }
      ];
    }
  ];
}

interface CourseMenuProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

interface Comment {
  replyComments: Comment[];
  _id: string;
  userId: {
    fullName: string;
    avatar: string;
    _id: string;
  };
  courseId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  mentionUserName: string;
  upvotes: number;
  downvotes: number;
  isRootComment: boolean;
}

const AccordionItem = ({ title, children }: AccordionItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-300 dark:border-gray-700 dark:bg-gray-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left py-3 px-4 bg-gray-200 hover:bg-gray-200 focus:outline-none flex items-center justify-between dark:bg-gray-800"
      >
        <span className="dark:text-white dark:font-bold">{title}</span>
        {isOpen ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-500 dark:text-white" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-white" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="px-10 overflow-hidden dark:text-white dark:bg-gray-900"
          >
            <div className="py-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CourseMenu: React.FC<CourseMenuProps> = ({
  currentTab,
  setCurrentTab,
}) => {
  return (
    <div className="flex space-x-4 rounded-md">
      <Button
        variant={currentTab === "course" ? "primary" : "outline"}
        onClick={() => setCurrentTab("course")}
      >
        Khóa học
      </Button>

      <Button
        variant={currentTab === "discussion" ? "primary" : "outline"}
        onClick={() => setCurrentTab("discussion")}
      >
        Thảo luận
      </Button>
    </div>
  );
};

const CourseContent = () => {
  const [course, setCourse] = useState<Course>();
  const { courseId } = useParams();
  const navigate = useNavigate();
  const userId = getUserIdFromLocalStorage();
  const token = useAccessToken();
  useEffect(() => {
    const fetchCourseUnit = async () => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/course/get-course-unit`,
        {
          courseId,
          userId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCourse(response.data.courseDetail);
    };
    fetchCourseUnit();
  }, [courseId, token, userId]);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-semibold mb-4 dark:text-white">
        {course?.course_name}
      </h1>
      {course?.lectures.map((lecture, idx) => (
        <AccordionItem key={idx} title={lecture.name}>
          <div className="space-y-2">
            {lecture.units.map((unit, cidx) => (
              <div
                key={cidx}
                className="text-gray-700 hover:text-gray-900 cursor-pointer px-4 py-2 hover:bg-gray-100 rounded-md dark:text-white dark:hover:bg-gray-700 flex items-center justify-between"
                onClick={() =>
                  navigate(`/your-course/${courseId}/unit/${unit._id}`)
                }
              >
                <span>{unit.title}</span>
              </div>
            ))}
          </div>
        </AccordionItem>
      ))}
    </div>
  );
};

interface CourseCommentSectionProps {
  courseId: string | undefined;
}

interface ReplyToProps {
  mentionUserName: string;
  commentId: string;
  mentionUserId: string;
}
const CourseCommentSection: React.FC<CourseCommentSectionProps> = ({
  courseId,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<ReplyToProps | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const userId = getUserIdFromLocalStorage();
  const token = useAccessToken();

  useEffect(() => {
    fetchComments();
  }, [courseId, currentPage]);

  const fetchComments = async () => {
    setLoading(true);
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/course/get-course-discussion`,
      {
        courseId,
        itemPerPage: 20,
        page: currentPage,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setComments(res.data.comments);
    setTotalPages(res.data.totalPages);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/user/post-comment`,
      {
        courseId,
        userId,
        content: newComment,
        replyTo,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const newCommentData = response.data;
    if (replyTo) {
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === replyTo.commentId
            ? {
                ...comment,
                replyComments: [...comment.replyComments, newCommentData],
              }
            : comment
        )
      );
    } else {
      // Nếu là bình luận gốc, thêm vào đầu danh sách
      setComments((prevComments) => [...prevComments, newCommentData]);
    }
    setNewComment("");
    setReplyTo(null);
  };

  const handleVote = async (commentId: string, type: "upvote" | "downvote") => {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/course/comment-vote`,
      {
        commentId,
        type,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setComments((prevComments) =>
      prevComments.map((comment) => {
        if (comment._id === commentId) {
          return {
            ...comment,
            upvotes: type === "upvote" ? comment.upvotes + 1 : comment.upvotes,
            downvotes:
              type === "downvote" ? comment.downvotes + 1 : comment.downvotes,
          };
        }
        if (comment.replyComments) {
          return {
            ...comment,
            replyComments: comment.replyComments.map((reply) => {
              if (reply._id === commentId) {
                return {
                  ...reply,
                  upvotes:
                    type === "upvote" ? reply.upvotes + 1 : reply.upvotes,
                  downvotes:
                    type === "downvote" ? reply.downvotes + 1 : reply.downvotes,
                };
              }
              return reply;
            }),
          };
        }
        return comment;
      })
    );
  };

  return (
    <div className="space-y-6 mt-8">
      <h3 className="text-xl font-semibold dark:text-white">Thảo luận</h3>

      {loading ? (
        <div>Đang tải bình luận...</div>
      ) : (
        comments.map((comment) => (
          <div
            key={comment._id}
            className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow text-sm"
          >
            {/* Root Comment */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-start gap-3">
                <img
                  src={comment.userId?.avatar || "/default-avatar.png"}
                  alt={comment.userId?.fullName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {comment.userId?.fullName || "Người dùng ẩn danh"}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {new Date(comment.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleVote(comment._id, "upvote")}
                  className="text-green-600 hover:underline"
                >
                  👍 {comment.upvotes}
                </Button>
                <Button
                  onClick={() => handleVote(comment._id, "downvote")}
                  className="text-red-500 hover:underline"
                >
                  👎 {comment.downvotes}
                </Button>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-2">
              {comment.content}
            </p>

            <Button
              onClick={() =>
                setReplyTo({
                  mentionUserName: comment.userId?.fullName,
                  commentId: comment._id,
                  mentionUserId: comment.userId?._id,
                })
              }
              className="text-sm text-blue-500 hover:underline"
            >
              Phản hồi
            </Button>

            {/* Reply Comments */}
            {comment.replyComments?.length > 0 && (
              <div className="mt-4 space-y-3 pl-6 border-l-2 border-gray-200 dark:border-gray-700">
                {comment.replyComments.map((reply: Comment) => (
                  <div key={reply._id} className="flex gap-3 items-start">
                    <img
                      src={reply.userId?.avatar || "/default-avatar.png"}
                      alt={reply.userId?.fullName}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {reply.userId?.fullName || "Người dùng ẩn danh"}
                          {reply.mentionUserName && (
                            <span className="text-xs text-gray-500 ml-2">
                              trả lời @{reply.mentionUserName}
                            </span>
                          )}
                        </p>
                        <div className="flex gap-2 text-xs">
                          <button
                            onClick={() => handleVote(reply._id, "upvote")}
                            className="text-green-600 hover:underline"
                          >
                            👍 {reply.upvotes}
                          </button>
                          <button
                            onClick={() => handleVote(reply._id, "downvote")}
                            className="text-red-500 hover:underline"
                          >
                            👎 {reply.downvotes}
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {reply.content}
                      </p>
                      <button
                        onClick={() =>
                          setReplyTo({
                            mentionUserName: reply.userId?.fullName,
                            commentId: comment._id,
                            mentionUserId: reply.userId?._id,
                          })
                        }
                        className="text-xs text-blue-500 hover:underline mt-1"
                      >
                        Phản hồi
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        {replyTo && (
          <div className="text-sm text-blue-500">
            Phản hồi bình luận của{" "}
            {replyTo.mentionUserName || "Người dùng ẩn danh"}
          </div>
        )}
        <textarea
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 dark:bg-gray-700 dark:text-gray-100"
          rows={3}
          placeholder="Nhập bình luận của bạn..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          required
        ></textarea>
        <div className="flex justify-between">
          <Button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Gửi bình luận
          </Button>
          {replyTo && (
            <Button
              type="button"
              onClick={() => setReplyTo(null)}
              className="text-sm text-red-500"
            >
              Hủy trả lời
            </Button>
          )}
        </div>
      </form>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

const YourCourseDetail = () => {
  const [currentTab, setCurrentTab] = useState<string>("course");
  const { courseId } = useParams();
  return (
    <div className="flex space-x-8">
      <div className="w-2/3">
        <CourseMenu currentTab={currentTab} setCurrentTab={setCurrentTab} />
        {currentTab == "course" && <CourseContent />}
        {currentTab == "discussion" && (
          <CourseCommentSection courseId={courseId} />
        )}
      </div>
    </div>
  );
};

export default YourCourseDetail;
