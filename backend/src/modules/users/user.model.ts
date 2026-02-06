// src/models/user.model.ts
import mongoose, { Document, Schema } from 'mongoose';
import argon2 from 'argon2';

/**
 * NOTE:
 * - Designed for the assignment requirements:
 *   name, email, education, skills[], projects[] { title, description, links }, work[], links { github, linkedin, portfolio }
 * - Adds: normalization, validation, indexes, and safe password hashing hook.
 */

interface IWork {
  title: string;
  description: string;
}

interface IUserLinks {
  github?: string;
  linkedin?: string;
  portfolio?: string;
}

interface IProjectLink {
  label: string; // e.g. "repo", "live", "docs"
  url: string;
}

interface IProject {
  title: string;
  description: string;
  skills: string[];
  links?: IProjectLink[];
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;

  education?: string;
  skills: string[];
  work: IWork[];
  links?: IUserLinks;
  projects: IProject[];

  comparePassword(candidatePassword: string): Promise<boolean>;
}

/** ---------- Helpers ---------- */
const normalizeSkill = (v: unknown) => (typeof v === 'string' ? v.trim().toLowerCase() : v);

const isValidHttpUrl = (value?: string) => {
  if (!value) return true;
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

/** ---------- Sub-schemas ---------- */
const workSchema = new Schema<IWork>(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { _id: false },
);

const userLinksSchema = new Schema<IUserLinks>(
  {
    github: {
      type: String,
      trim: true,
      validate: {
        validator: (v: string) => isValidHttpUrl(v),
        message: 'github must be a valid http/https url',
      },
    },
    linkedin: {
      type: String,
      trim: true,
      validate: {
        validator: (v: string) => isValidHttpUrl(v),
        message: 'linkedin must be a valid http/https url',
      },
    },
    portfolio: {
      type: String,
      trim: true,
      validate: {
        validator: (v: string) => isValidHttpUrl(v),
        message: 'portfolio must be a valid http/https url',
      },
    },
  },
  { _id: false },
);

const projectLinkSchema = new Schema<IProjectLink>(
  {
    label: { type: String, required: true, trim: true, maxlength: 30 },
    url: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (v: string) => isValidHttpUrl(v),
        message: 'project link url must be a valid http/https url',
      },
    },
  },
  { _id: false },
);

const projectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    skills: {
      type: [String],
      default: [],
      set: (arr: unknown) => (Array.isArray(arr) ? arr.map(normalizeSkill).filter(Boolean) : []),
    },
    links: { type: [projectLinkSchema], default: [] },
  },
  { _id: false },
);

/** ---------- Main schema ---------- */
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 150,
      validate: {
        // simple, good-enough email check
        validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: 'Invalid email format',
      },
    },

    // IMPORTANT: do NOT trim passwords
    password: { type: String, required: true, minlength: 8 },

    education: { type: String, trim: true, maxlength: 500 },

    skills: {
      type: [String],
      default: [],
      set: (arr: unknown) => (Array.isArray(arr) ? arr.map(normalizeSkill).filter(Boolean) : []),
    },

    work: { type: [workSchema], default: [] },

    links: { type: userLinksSchema, default: {} },

    projects: { type: [projectSchema], default: [] },
  },
  { timestamps: true },
);

/** ---------- Indexes (for your query endpoints) ---------- */
// Email unique already, but explicit index is fine:
userSchema.index({ email: 1 }, { unique: true });

// Filter endpoints:
userSchema.index({ skills: 1 });
userSchema.index({ 'projects.skills': 1 });

// Search endpoint (GET /search?q=...):
userSchema.index({
  name: 'text',
  education: 'text',
  skills: 'text',
  'projects.title': 'text',
  'projects.description': 'text',
  'work.title': 'text',
  'work.description': 'text',
});

/** ---------- Hooks / methods ---------- */
userSchema.pre('save', async function () {
  // Hash only if password changed
  if (!this.isModified('password')) return;
  this.password = await argon2.hash(this.password);
});

userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return argon2.verify(this.password, candidatePassword);
};

/** ---------- Model ---------- */
const User = mongoose.model<IUser>('User', userSchema);
export default User;
