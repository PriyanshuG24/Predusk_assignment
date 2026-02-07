"use client";
import React, { useState } from "react";
import { Briefcase, Building, Plus } from "lucide-react";
import { ENDPOINTS, apiRequest } from "@/api";
import type { Work } from "@/types/index";

const Work = (props: { work: Work[] }) => {
  const [workTitle, setWorkTitle] = useState("");
  const [workDesc, setWorkDesc] = useState("");
  const [work, setWork] = useState<Work[]>(props.work);
  const handleAddWork = async () => {
    try {
      const response = await apiRequest(ENDPOINTS.addWork, {
        method: "POST",
        body: { title: workTitle, description: workDesc },
      });
      const newWork = response.data.work[response.data.work.length - 1];
      setWork([...work, newWork]);
      setWorkTitle("");
      setWorkDesc("");
    } catch (e: unknown) {
      console.log(e);
    }
  };
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-indigo-600" />
          Work Experience
        </h3>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {(work || []).length === 0 ? (
            <div className="text-center py-12">
              <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No work experience added yet.</p>
            </div>
          ) : (
            work.map((w: Work) => (
              <div
                key={w._id}
                className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all hover:border-indigo-200"
              >
                <h4 className="font-semibold text-gray-900 text-lg">
                  {w.title}
                </h4>
                <p className="text-gray-600 mt-2 leading-relaxed">
                  {w.description}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5 text-indigo-600" />
          Add Work
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Job Title
            </label>
            <input
              value={workTitle}
              onChange={(e) => setWorkTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="e.g., Senior Developer"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={workDesc}
              onChange={(e) => setWorkDesc(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
              rows={4}
              placeholder="Describe your role and responsibilities..."
            />
          </div>
          <button
            onClick={handleAddWork}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg"
          >
            Add Work Experience
          </button>
        </div>
      </div>
    </div>
  );
};

export default Work;
