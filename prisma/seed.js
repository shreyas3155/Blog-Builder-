import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper to convert paragraph blocks to TipTap JSON
function createSimpleTipTapJSON(paragraphsAndHeadings) {
  const content = [];
  paragraphsAndHeadings.forEach((block) => {
    if (block.type === 'heading') {
      content.push({
        type: 'heading',
        attrs: { level: block.level || 2 },
        content: [{ type: 'text', text: block.text }],
      });
    } else if (block.type === 'blockquote') {
      content.push({
        type: 'blockquote',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: block.text }],
          },
        ],
      });
    } else {
      content.push({
        type: 'paragraph',
        content: [{ type: 'text', text: block.text }],
      });
    }
  });

  return JSON.stringify({ type: 'doc', content });
}

async function main() {
  console.log('Clearing database...');
  await prisma.view.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.blog.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding users...');
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Sarah Connor',
      email: 'admin@blogbuilder.com',
      passwordHash,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  const employee = await prisma.user.create({
    data: {
      name: 'Alex Mercer',
      email: 'employee@blogbuilder.com',
      passwordHash,
      role: 'EMPLOYEE',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const reader = await prisma.user.create({
    data: {
      name: 'Jane Doe',
      email: 'reader@blogbuilder.com',
      passwordHash,
      role: 'READER',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    },
  });

  console.log('Seeding categories...');
  const catAnalytics = await prisma.category.create({ data: { name: 'Data & Analytics', slug: 'data-analytics' } });
  const catCareers = await prisma.category.create({ data: { name: 'Careers & Tech', slug: 'careers-tech' } });
  const catProductivity = await prisma.category.create({ data: { name: 'Productivity', slug: 'productivity' } });

  console.log('Seeding tags...');
  const tagAnalytics = await prisma.tag.create({ data: { name: 'analytics', slug: 'analytics' } });
  const tagBi = await prisma.tag.create({ data: { name: 'business intelligence', slug: 'business-intelligence' } });
  const tagTrends = await prisma.tag.create({ data: { name: 'data trends', slug: 'data-trends' } });
  
  const tagFullStack = await prisma.tag.create({ data: { name: 'full-stack development', slug: 'full-stack-development' } });
  const tagHiring = await prisma.tag.create({ data: { name: 'hiring', slug: 'hiring' } });
  const tagCareers = await prisma.tag.create({ data: { name: 'software careers', slug: 'software-careers' } });
  
  const tagHabits = await prisma.tag.create({ data: { name: 'developer habits', slug: 'developer-habits' } });
  const tagProd = await prisma.tag.create({ data: { name: 'productivity', slug: 'productivity' } });
  const tagCoding = await prisma.tag.create({ data: { name: 'coding tips', slug: 'coding-tips' } });

  console.log('Seeding blogs...');
  const blogsData = [
    {
      title: 'The Future of Data Analytics: What Every Business Should Know in 2026',
      slug: 'the-future-of-data-analytics-what-every-business-should-know-in-2026',
      excerpt: "The shift from reactive reporting to real-time, predictive analytics has changed how businesses make decisions.",
      coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200',
      published: true,
      publishedAt: new Date(),
      authorId: employee.id,
      categoryId: catAnalytics.id,
      tags: { connect: [{ id: tagAnalytics.id }, { id: tagBi.id }, { id: tagTrends.id }] },
      content: createSimpleTipTapJSON([
        { type: 'paragraph', text: "Data used to be something companies collected. Today, it's something companies think with." },
        { type: 'paragraph', text: "The shift from reactive reporting to real-time, predictive analytics has changed how businesses make decisions. A decade ago, most companies looked at last month's numbers to plan next quarter. Now, dashboards update by the second, and AI models forecast outcomes before a trend even fully forms." },
        { type: 'heading', level: 2, text: '1. From Descriptive to Predictive' },
        { type: 'paragraph', text: 'Traditional analytics answered "what happened?" Modern analytics answers "what\'s likely to happen next?" — and increasingly, "what should we do about it?" Predictive models are now embedded directly into everyday tools, not just specialist software.' },
        { type: 'heading', level: 2, text: '2. Democratization of Data' },
        { type: 'paragraph', text: 'You no longer need a data science degree to explore data. No-code dashboards and natural-language query tools mean a marketing manager can ask "which campaign drove the most signups last week?" and get an instant, visual answer.' },
        { type: 'heading', level: 2, text: '3. The Rise of Real-Time Decisioning' },
        { type: 'paragraph', text: 'Batch reports run overnight are being replaced by streaming analytics — useful for fraud detection, inventory management, and customer experience personalization, where a delay of even a few hours can mean lost revenue.' },
        { type: 'heading', level: 2, text: '4. Privacy-First Analytics' },
        { type: 'paragraph', text: 'With tightening data regulations globally, businesses are investing in privacy-preserving analytics — aggregated insights without exposing individual user data. This isn\'t just compliance; it\'s becoming a trust differentiator.' },
        { type: 'blockquote', text: 'Takeaway: Companies that treat analytics as a core decision-making layer — not just a reporting function — are the ones that will move faster and smarter in the years ahead.' }
      ])
    },
    {
      title: 'Why Full-Stack Developers Are More Valuable Than Ever',
      slug: 'why-full-stack-developers-are-more-valuable-than-ever',
      excerpt: "A good full-stack developer isn't someone who knows a little of everything — it's someone who knows enough of everything to build something that actually works, end to end.",
      coverImage: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=1200',
      published: true,
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      authorId: employee.id,
      categoryId: catCareers.id,
      tags: { connect: [{ id: tagFullStack.id }, { id: tagHiring.id }, { id: tagCareers.id }] },
      content: createSimpleTipTapJSON([
        { type: 'paragraph', text: "A good full-stack developer isn't someone who knows a little of everything — it's someone who knows enough of everything to build something that actually works, end to end." },
        { type: 'heading', level: 2, text: '1. Startups Need Builders, Not Specialists (At First)' },
        { type: 'paragraph', text: 'Early-stage companies rarely have the luxury of ten specialized engineers. They need people who can design a database schema in the morning and fix a CSS bug in the afternoon. Full-stack developers fill that gap.' },
        { type: 'heading', level: 2, text: '2. The Modern Stack Has Gotten More Unified' },
        { type: 'paragraph', text: "With frameworks like Next.js blurring the line between frontend and backend, and tools like Prisma simplifying database work, it's genuinely easier than it used to be for one person to own a feature from UI to API to database." },
        { type: 'heading', level: 2, text: '3. Faster Iteration, Fewer Handoffs' },
        { type: 'paragraph', text: "When one person understands the whole flow of a feature, there's less back-and-forth between teams. Bugs get fixed faster because there's no \"that's not my part of the stack\" excuse." },
        { type: 'heading', level: 2, text: '4. What Companies Actually Look For' },
        { type: 'paragraph', text: 'Beyond just knowing React and Node, companies increasingly value full-stack developers who understand basic system design and API structuring, authentication and security fundamentals, deployment and debugging in production, and writing clean, readable, and testable code.' },
        { type: 'blockquote', text: "Takeaway: Full-stack development isn't about being a jack-of-all-trades and master of none — it's about being able to take an idea from concept to a working, deployed product. That skill only becomes more valuable as teams stay lean and timelines get tighter." }
      ])
    },
    {
      title: '5 Small Habits That Make You a Better Developer',
      slug: '5-small-habits-that-make-you-a-better-developer',
      excerpt: "None of these habits require extra time in your day — they just require a small shift in how you already work.",
      coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200',
      published: true,
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      authorId: admin.id,
      categoryId: catProductivity.id,
      tags: { connect: [{ id: tagHabits.id }, { id: tagProd.id }, { id: tagCoding.id }] },
      content: createSimpleTipTapJSON([
        { type: 'paragraph', text: "1. Read code more than you write it. Reviewing others' code — even messy code — teaches you patterns and anti-patterns faster than tutorials do." },
        { type: 'paragraph', text: "2. Write commit messages like someone else will read them. Because they will — including future you." },
        { type: 'paragraph', text: "3. Google the error message, not the whole problem. Specific errors lead to specific answers." },
        { type: 'paragraph', text: "4. Refactor in small steps. Big rewrites break things; small, tested changes don't." },
        { type: 'paragraph', text: "5. Take breaks before you're stuck for an hour. A 10-minute walk often solves what an hour of staring at the screen won't." },
        { type: 'paragraph', text: "None of these habits require extra time in your day — they just require a small shift in how you already work." }
      ])
    },
    {
      title: 'Draft: Modern Designing Guidelines for Frosted Glass Cards',
      slug: 'modern-design-frosted-glass-cards',
      excerpt: "Unpublished outline evaluating visual contrast structures in UI layout panels.",
      coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200',
      published: false,
      authorId: employee.id,
      categoryId: catCareers.id,
      tags: { connect: [{ id: tagCoding.id }] },
      content: createSimpleTipTapJSON([
        { type: 'paragraph', text: "Frosted glass elements require highly structured spacing borders and distinct backdrop drop filters to ensure proper readability and contrast under dark themes." }
      ])
    }
  ];

  for (const blog of blogsData) {
    const createdBlog = await prisma.blog.create({ data: blog });
    console.log(`Created blog: ${createdBlog.title}`);
    
    // Seed mock interactions: views, likes, comments
    if (createdBlog.published) {
      await prisma.view.create({ data: { blogId: createdBlog.id, ip: '127.0.0.1' } });
      await prisma.view.create({ data: { blogId: createdBlog.id, ip: '192.168.1.1' } });
      await prisma.view.create({ data: { blogId: createdBlog.id, ip: '10.0.0.5' } });
      
      await prisma.like.create({
        data: {
          blogId: createdBlog.id,
          userId: reader.id,
        },
      });

      await prisma.comment.create({
        data: {
          blogId: createdBlog.id,
          authorId: reader.id,
          content: 'This is an incredibly helpful article! The design principles outlined here are top-tier.',
        },
      });
      await prisma.comment.create({
        data: {
          blogId: createdBlog.id,
          authorId: employee.id,
          content: 'Glad you liked it! We focused heavily on readability and typography rules.',
        },
      });
    }
  }

  console.log('Database seeded successfully! 🌱');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    pool.end();
  });
