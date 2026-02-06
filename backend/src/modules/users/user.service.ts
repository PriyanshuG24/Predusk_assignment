import User from "./user.model.js";
import { env } from "../../config/env.js";
import { BadRequestError } from "../../lib/error.js";
import {
  IWork,
  IUserLinks,
  isValidHttpUrl,
  IProjectLink,
} from "../users/user.model.js";
import mongoose from "mongoose";
export const getUserProfile = async () => {
  try {
    const user = await User.findOne({
      email: env.BASIC_AUTH_EMAIL,
    });
    return user;
  } catch (error) {
    throw new BadRequestError("User not found", error);
  }
};

export const updateUserProfile = async (data: {
  education: string;
  skills: string[];
}) => {
  try {
    const user = await User.findOneAndUpdate(
      {
        email: env.BASIC_AUTH_EMAIL,
      },
      data,
      { new: true },
    );
    return user;
  } catch (error) {
    throw new BadRequestError("User not found", error);
  }
};

export const updateUserWork = async (data: IWork) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: env.BASIC_AUTH_EMAIL },
      {
        $push: {
          work: {
            title: data.title,
            description: data.description,
            _id: new mongoose.Types.ObjectId(),
          },
        },
      },
      { new: true },
    );
    return user;
  } catch (error) {
    throw new BadRequestError("Failed to add work", error);
  }
};

export const updateUserLinks = async (data: IUserLinks) => {
  Object.entries(data).forEach(([, value]) => {
    if (value && !isValidHttpUrl(value)) {
      throw new BadRequestError("Invalid URL");
    }
  });

  const user = await User.findOneAndUpdate(
    { email: env.BASIC_AUTH_EMAIL },
    { links: data },
    { new: true },
  );

  if (!user) {
    throw new BadRequestError("User not found");
  }

  return user;
};

export const deleteProjectById = async (id: string) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: env.BASIC_AUTH_EMAIL },
      {
        $pull: {
          projects: { _id: id },
        },
      },
      { new: true },
    );

    if (!user) {
      throw new BadRequestError("User not found");
    }

    return user.projects;
  } catch (error) {
    throw new BadRequestError("Failed to delete project", error);
  }
};

export const addProject = async (data: {
  title: string;
  description: string;
  skills: string[];
  links: IProjectLink[];
}) => {
  try {
    const validLinks = data.links.filter(
      (link) =>
        link.label.trim() && link.url.trim() && isValidHttpUrl(link.url),
    );

    const newProject = {
      title: data.title.trim(),
      description: data.description.trim(),
      skills: data.skills.map((skill) => skill.trim()).filter(Boolean),
      links: validLinks,
      _id: new mongoose.Types.ObjectId(),
    };

    const user = await User.findOneAndUpdate(
      { email: env.BASIC_AUTH_EMAIL },
      {
        $push: {
          projects: newProject,
        },
      },
      { new: true },
    );

    if (!user) {
      throw new BadRequestError("User not found");
    }

    return user.projects;
  } catch (error) {
    throw new BadRequestError("Failed to add project", error);
  }
};

export const updateProject = async (data: {
  projectId: string;
  title: string;
  description: string;
  skills: string[];
  links: IProjectLink[];
}) => {
  try {
    const validLinks = data.links.filter(
      (link) =>
        link.label.trim() && link.url.trim() && isValidHttpUrl(link.url),
    );

    const user = await User.findOneAndUpdate(
      {
        email: env.BASIC_AUTH_EMAIL,
        "projects._id": data.projectId,
      },
      {
        $set: {
          "projects.$.title": data.title.trim(),
          "projects.$.description": data.description.trim(),
          "projects.$.skills": data.skills
            .map((skill) => skill.trim())
            .filter(Boolean),
          "projects.$.links": validLinks,
        },
      },
      { new: true },
    );

    if (!user) {
      throw new BadRequestError("User or project not found");
    }

    return user.projects;
  } catch (error) {
    throw new BadRequestError("Failed to update project", error);
  }
};
