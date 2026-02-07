"use client";

import { useEffect, useMemo, useState } from "react";
import { UserProfile, Links } from "../types";
import { ENDPOINTS, apiRequest } from "../api";
import {
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Code2,
  Trophy,
  User,
  RefreshCw,
  AlertCircle,
  GraduationCap,
  Award,
} from "lucide-react";
import WorkComponent from "@/components/ui/home/WorkComponent";
import ProjectComponent from "@/components/ui/home/ProjectComponent";
import { toast } from "sonner";

export default function Home() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const [education, setEducation] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [links, setLinks] = useState<Links>({
    github: "",
    linkedin: "",
    portfolio: "",
    codechef: "",
    leetcode: "",
  });

  const skillsArray = useMemo(() => {
    return skillsText
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);
  }, [skillsText]);

  async function loadProfile() {
    setErrMsg("");
    setLoading(true);
    try {
      const data = await apiRequest(ENDPOINTS.profile, { method: "GET" });
      const profile = data?.data || null;
      setUserProfile(profile);

      setEducation(profile?.education || "");
      setSkillsText((profile?.skills || []).join(", "));
      setLinks({
        github: profile?.links?.github || "",
        linkedin: profile?.links?.linkedin || "",
        portfolio: profile?.links?.portfolio || "",
        codechef: profile?.links?.codechef || "",
        leetcode: profile?.links?.leetcode || "",
      });
    } catch (e: unknown) {
      toast.error((e as Error)?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function handleUpdateProfile() {
    setErrMsg("");
    try {
      await apiRequest(ENDPOINTS.updateProfile, {
        method: "PUT",
        body: {
          education,
          skills: skillsArray,
        },
      });
      await loadProfile();
      toast.success("Profile updated successfully");
    } catch (e: unknown) {
      toast.error((e as Error)?.message || "Update failed");
    }
  }

  async function handleUpdateLinks() {
    setErrMsg("");
    try {
      const data = await apiRequest(ENDPOINTS.updateLinks, {
        method: "PUT",
        body: { links },
      });
      setLinks((prev) => ({
        ...prev,
        github: data?.data?.links?.github || "",
        linkedin: data?.data?.links?.linkedin || "",
        portfolio: data?.data?.links?.portfolio || "",
        codechef: data?.data?.links?.codechef || "",
        leetcode: data?.data?.links?.leetcode || "",
      }));
      toast.success("Links updated successfully");
    } catch (e: unknown) {
      console.log(e);
      toast.error((e as Error)?.message || "Update links failed");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-sm text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-xl border p-4">
          <div className="font-semibold">No profile loaded</div>
          {errMsg ? (
            <div className="mt-2 text-sm text-red-600">{errMsg}</div>
          ) : null}
          <button
            onClick={loadProfile}
            className="mt-4 rounded-lg bg-black text-white px-4 py-2 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { name, email, skills, links: linksObj } = userProfile;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          <header className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600  rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Portfolio Dashboard
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Manage your professional portfolio
                  </p>
                </div>
              </div>
              <button
                onClick={loadProfile}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </header>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-indigo-600 hover:bg-blue-600 rounded-xl flex items-center justify-center">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
                  <p className="text-gray-600">{email}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <GraduationCap className="w-4 h-4" />
                    Education
                  </label>
                  <textarea
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                    rows={3}
                    placeholder="Your education background..."
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Award className="w-4 h-4" />
                    Skills
                  </label>
                  <input
                    value={skillsText}
                    onChange={(e) => setSkillsText(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="node, express, mongodb..."
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(skillsArray.length ? skillsArray : skills || []).map(
                      (s) => (
                        <span
                          key={s}
                          className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100"
                        >
                          {s}
                        </span>
                      ),
                    )}
                  </div>
                </div>

                <button
                  onClick={handleUpdateProfile}
                  className="w-full bg-indigo-600 hover:bg-blue-600 text-white px-4 py-3 rounded-xl  font-medium shadow-lg"
                >
                  Save Profile
                </button>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                Links
              </h3>
              <div className="space-y-4">
                {[
                  {
                    key: "github",
                    icon: Github,
                    label: "GitHub",
                    color: "hover:border-gray-400",
                  },
                  {
                    key: "linkedin",
                    icon: Linkedin,
                    label: "LinkedIn",
                    color: "hover:border-blue-400",
                  },
                  {
                    key: "portfolio",
                    icon: Globe,
                    label: "Portfolio",
                    color: "hover:border-green-400",
                  },
                  {
                    key: "codechef",
                    icon: Code2,
                    label: "CodeChef",
                    color: "hover:border-orange-400",
                  },
                  {
                    key: "leetcode",
                    icon: Trophy,
                    label: "LeetCode",
                    color: "hover:border-yellow-400",
                  },
                ].map(({ key, icon: Icon, label, color }) => (
                  <div key={key} className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Icon className="w-4 h-4" />
                      {label}
                    </label>
                    <input
                      value={links[key as keyof Links] || ""}
                      onChange={(e) =>
                        setLinks((prev) => ({ ...prev, [key]: e.target.value }))
                      }
                      className={`w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm ${color}`}
                      placeholder={`https://${key}.com/...`}
                    />
                    {linksObj?.[key as keyof Links] && (
                      <a
                        href={linksObj[key as keyof Links]}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View current
                      </a>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleUpdateLinks}
                className="w-full mt-6 bg-indigo-600 hover:bg-blue-600 text-white px-4 py-3 rounded-xl font-medium shadow-lg"
              >
                Save Links
              </button>
            </div>
          </div>
          <WorkComponent work={userProfile?.work || []} />
          <ProjectComponent projects={userProfile?.projects || []} />
        </div>
      </div>
    </div>
  );
}
