import mongoose, { Document, Schema } from 'mongoose';
import argon2 from 'argon2';

export interface IWork {
  title: string;
  description: string;
}

export interface IUserLinks {
  github?: string;
  linkedin?: string;
  portfolio?: string;
  codechef?: string;
  leetcode?: string;
}

export interface IProjectLink {
  label: string;
  url: string;
}

export interface IProject {
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

const normalizeSkill = (v: unknown) => (typeof v === 'string' ? v.trim().toLowerCase() : v);

export const isValidHttpUrl = (value?: string) => {
  if (!value) return true;
  try {
    const u = new URL(value);
    console.log(u);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

const workSchema = new Schema<IWork>({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
});

const userLinksSchema = new Schema<IUserLinks>({
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
  codechef: {
    type: String,
    trim: true,
    validate: {
      validator: (v: string) => isValidHttpUrl(v),
      message: 'codechef link must be a valid http/https url',
    },
  },
  leetcode: {
    type: String,
    trim: true,
    validate: {
      validator: (v: string) => isValidHttpUrl(v),
      message: 'leetcode link must be a valid http/https url',
    },
  },
});

const projectLinkSchema = new Schema<IProjectLink>({
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
});

const projectSchema = new Schema<IProject>({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 3000 },
  skills: {
    type: [String],
    default: [],
    set: (arr: unknown) => (Array.isArray(arr) ? arr.map(normalizeSkill).filter(Boolean) : []),
  },
  links: { type: [projectLinkSchema], default: [] },
});

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
        validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: 'Invalid email format',
      },
    },

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

userSchema.index({ skills: 1 });
userSchema.index({ 'projects.skills': 1 });

userSchema.index({
  name: 'text',
  education: 'text',
  skills: 'text',
  'projects.title': 'text',
  'projects.description': 'text',
  'work.title': 'text',
  'work.description': 'text',
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await argon2.hash(this.password);
});

userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return argon2.verify(this.password, candidatePassword);
};

const User = mongoose.model<IUser>('UserPredusk', userSchema);
export default User;
