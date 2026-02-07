"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { ENDPOINTS, apiRequest } from "@/api";
import { UserProfile, Project, ProjectLink, Links } from "@/types";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  ExternalLink,
} from "lucide-react";
import { Button } from "../button";
import { toast } from "sonner";

const ProjectComponent = (props: { projects: Project[] }) => {
  const [projects, setProjects] = useState<Project[]>(props.projects || []);

  const [projTitle, setProjTitle] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projSkillsText, setProjSkillsText] = useState("");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(4);
  const [projLinkLabel, setProjLinkLabel] = useState("");
  const [projLinkUrl, setProjLinkUrl] = useState("");
  const [projectLinks, setProjectLinks] = useState<
    { label: string; url: string }[]
  >([]);

  const allSkills = [
    "JavaScript",
    "TypeScript",
    "Reactjs",
    "Node.js",
    "MongoDB",
    "Express",
    "Python",
    "Django",
    "PostgreSQL",
    "Docker",
    "AWS",
    "GraphQL",
  ];

  const debouncedSearch = useCallback(async () => {
    try {
      const response = await apiRequest(
        `${ENDPOINTS.searchProject}?searchQuery=${encodeURIComponent(searchQuery)}&skills=${encodeURIComponent(selectedSkills.join(","))}&page=${currentPage}&limit=${pageSize}`,
        {
          method: "GET",
        },
      );
      console.log(
        "Searching for:",
        searchQuery,
        "skills:",
        selectedSkills,
        "page:",
        currentPage,
      );
      setProjects(response.data.projects);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (e: unknown) {
      toast.error((e as Error)?.message || "Search failed");
    }
  }, [searchQuery, selectedSkills, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSkills]);

  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [debouncedSearch]);

  async function handleUpdateProject() {
    if (!editingProject) return;
    try {
      const skills = projSkillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const validLinks = projectLinks.filter(
        (link) => link.label.trim() && link.url.trim(),
      );

      const response = await apiRequest(ENDPOINTS.updateProject, {
        method: "PUT",
        body: {
          projectId: editingProject._id,
          title: projTitle,
          description: projDesc,
          skills,
          links: validLinks,
        },
      });

      setProjTitle("");
      setProjDesc("");
      setProjSkillsText("");
      setProjectLinks([]);
      setProjects(response.data.projects);
      setEditingProject(null);
      cancelEditProject();
      toast.success("Project updated successfully");
    } catch (e: unknown) {
      toast.error((e as Error)?.message || "Update project failed");
    }
  }

  async function handleDeleteProject(projectId: string) {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      const response = await apiRequest(ENDPOINTS.deleteProject, {
        method: "DELETE",
        body: { projectId },
      });
      console.log(response);
      setProjects(response.data.projects);
      toast.success("Project deleted successfully");
    } catch (e: unknown) {
      toast.error((e as Error)?.message || "Delete project failed");
    }
  }

  function startEditProject(project: Project) {
    setEditingProject(project);
    setProjTitle(project.title);
    setProjDesc(project.description);
    setProjSkillsText(project.skills.join(", "));
    if (project.links && project.links.length > 0) {
      setProjectLinks(
        project.links.map((link) => ({ label: link.label, url: link.url })),
      );
    } else {
      setProjectLinks([]);
    }
  }

  function cancelEditProject() {
    setEditingProject(null);
    setProjTitle("");
    setProjDesc("");
    setProjSkillsText("");
    setProjectLinks([]);
    setProjLinkLabel("");
    setProjLinkUrl("");
  }

  function addNewLinkInput() {
    setProjectLinks([...projectLinks, { label: "", url: "" }]);
  }

  function updateLink(index: number, field: "label" | "url", value: string) {
    const updatedLinks = [...projectLinks];
    updatedLinks[index][field] = value;
    setProjectLinks(updatedLinks);
  }

  function removeLink(index: number) {
    setProjectLinks(projectLinks.filter((_, i) => i !== index));
  }

  async function handleAddProject() {
    try {
      const skills = projSkillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const validLinks = projectLinks.filter(
        (link) => link.label.trim() && link.url.trim(),
      );

      const response = await apiRequest(ENDPOINTS.addProject, {
        method: "POST",
        body: {
          title: projTitle,
          description: projDesc,
          skills,
          links: validLinks,
        },
      });

      setProjTitle("");
      setProjDesc("");
      setProjSkillsText("");
      setProjectLinks([]);
      setProjects(response.data.projects);
      toast.success("Project added successfully");
    } catch (e: unknown) {
      toast.error((e as Error)?.message || "Add project failed");
    }
  }

  async function handleSearch() {
    try {
      const response = await apiRequest(
        `${ENDPOINTS.searchProject}?searchQuery=${encodeURIComponent(searchQuery)}&skills=${encodeURIComponent(selectedSkills.join(","))}`,
        {
          method: "GET",
        },
      );
      console.log("Searching for:", searchQuery, "skills:", selectedSkills);
      setProjects(response.data.projects);
      toast.success("Search successful");
    } catch (e: unknown) {
      toast.error((e as Error)?.message || "Search failed");
    }
  }
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600" />
            Projects
          </h3>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm w-full sm:w-64"
              />
            </div>
          </div>
        </div>
      </div>

      {allSkills.length > 0 && (
        <div className="mt-4 ml-8">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Filter by Skills:
          </h4>
          <div className="flex flex-wrap gap-3">
            {allSkills.map((skill: string) => (
              <label
                key={skill}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedSkills.includes(skill)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedSkills([...selectedSkills, skill]);
                    } else {
                      setSelectedSkills(
                        selectedSkills.filter((s) => s !== skill),
                      );
                    }
                  }}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">💻 {skill}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      <div className="p-6">
        <div className="mb-8 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
          <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            {editingProject ? (
              <>
                <Edit2 className="w-4 h-4 text-indigo-600" />
                Edit Project
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-indigo-600" />
                Add New Project
              </>
            )}
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Project Title
              </label>
              <input
                value={projTitle}
                onChange={(e) => setProjTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="e.g., E-commerce Platform"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Skills (comma separated)
              </label>
              <input
                value={projSkillsText}
                onChange={(e) => setProjSkillsText(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="node, express, mongodb..."
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={projDesc}
                onChange={(e) => setProjDesc(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                rows={4}
                placeholder="Describe your project, technologies used, and your role..."
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Project Links
              </label>
              <div className="space-y-3">
                {projectLinks.map((link, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Link Label
                      </label>
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) =>
                          updateLink(index, "label", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        placeholder="e.g., GitHub, Live Demo, Documentation"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Link URL
                      </label>
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) =>
                          updateLink(index, "url", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        placeholder="https://..."
                      />
                    </div>
                    {projectLinks.length > 1 && (
                      <button
                        onClick={() => removeLink(index)}
                        className="md:col-span-2 mt-2 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                      >
                        Remove Link
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addNewLinkInput}
                className="mt-3 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium"
              >
                + Add Another Link
              </button>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={editingProject ? handleUpdateProject : handleAddProject}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-blue-600 text-white rounded-xl font-medium shadow-lg"
            >
              <Save className="w-4 h-4" />
              {editingProject ? "Update" : "Add"} Project
            </button>
            {editingProject && (
              <button
                onClick={cancelEditProject}
                className="flex items-center gap-2 px-6 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}
          </div>
        </div>
        {!projects || projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              No Projects Yet
            </h4>
            <p className="text-gray-600 max-w-md mx-auto">
              Start building your portfolio by adding your first project above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: Project) => (
              <div
                key={project._id}
                className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all hover:border-indigo-200 hover:-translate-y-1"
              >
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => startEditProject(project)}
                    className="p-2 bg-indigo-600 text-white rounded-lg bg-indigo-100  shadow-md cursor-pointer hover:bg-indigo-800"
                    title="Edit project"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project._id)}
                    className="p-2 bg-red-600 text-white rounded-lg bg-red-500  shadow-md cursor-pointer hover:bg-red-800"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="pr-16">
                  <h4 className="font-bold text-gray-900 text-lg mb-3 line-clamp-1">
                    {project.title}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-lg text-xs font-medium border border-indigo-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  {project.links && project.links.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {project.links.map((link: ProjectLink) => (
                        <a
                          key={link._id}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors font-medium"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {link.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6 mb-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${
                      pageNum === currentPage
                        ? "bg-indigo-600 text-white"
                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>

            <span className="ml-4 text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectComponent;
