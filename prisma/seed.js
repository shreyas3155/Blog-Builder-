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

// Standard TipTap JSON mock generator helper
function createTipTapContent(title, paragraph1, quote, code, paragraph2) {
  const doc = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: title }]
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: paragraph1 }]
      },
      {
        type: 'blockquote',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: quote }]
          }
        ]
      },
      {
        type: 'codeBlock',
        attrs: { language: 'javascript' },
        content: [{ type: 'text', text: code }]
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: paragraph2 }]
      }
    ]
  };
  return JSON.stringify(doc);
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
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Technology', slug: 'technology' } }),
    prisma.category.create({ data: { name: 'Design', slug: 'design' } }),
    prisma.category.create({ data: { name: 'SaaS', slug: 'saas' } }),
    prisma.category.create({ data: { name: 'Productivity', slug: 'productivity' } }),
    prisma.category.create({ data: { name: 'Marketing', slug: 'marketing' } }),
  ]);

  console.log('Seeding tags...');
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'Next.js', slug: 'nextjs' } }),
    prisma.tag.create({ data: { name: 'TailwindCSS', slug: 'tailwindcss' } }),
    prisma.tag.create({ data: { name: 'React', slug: 'react' } }),
    prisma.tag.create({ data: { name: 'Database', slug: 'database' } }),
    prisma.tag.create({ data: { name: 'UI/UX', slug: 'ui-ux' } }),
    prisma.tag.create({ data: { name: 'Prisma', slug: 'prisma' } }),
  ]);

  console.log('Seeding blogs...');
  const blogsData = [
    {
      title: 'Building a Premium SaaS Platform with Next.js 15',
      slug: 'building-premium-saas-nextjs-15',
      excerpt: 'Learn the core principles of constructing a modern, production-ready SaaS application with styling, databases, and secure authentication.',
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200',
      published: true,
      publishedAt: new Date(),
      authorId: admin.id,
      categoryId: categories[0].id, // Tech
      tags: { connect: [{ id: tags[0].id }, { id: tags[1].id }, { id: tags[2].id }] },
      content: createTipTapContent(
        'Building a Premium SaaS Platform with Next.js 15',
        'Creating a modern SaaS platform is not just about writing code; it is about establishing a high-end visual design language, ensuring blazingly fast response times, and maintaining top-tier security standards. Next.js 15 provides an outstanding platform to accomplish all of these goals out of the box using Server Components.',
        'Good design is obvious. Great design is transparent. - Joe Sparano',
        `// Example Next.js 15 Route Handler
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'active', version: '15.1.0' });
}`,
        'By utilizing features such as App Router middlewares, HttpOnly cookies, and clean Zod validation schemas, developers can ensure their applications are robust against common security threats while keeping developer velocity extremely high.'
      )
    },
    {
      title: 'Why Glassmorphism is Making a Comeback in Web Design',
      slug: 'why-glassmorphism-comeback-web-design',
      excerpt: 'Exploring the visual aesthetics of transparent layouts, backdrop filters, and subtle border shadows that feel extremely premium.',
      coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200',
      published: true,
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      authorId: employee.id,
      categoryId: categories[1].id, // Design
      tags: { connect: [{ id: tags[1].id }, { id: tags[4].id }] },
      content: createTipTapContent(
        'Why Glassmorphism is Making a Comeback in Web Design',
        'Web layouts are evolving past flat borders and solid colors. Designers at Stripe, Linear, and Vercel are leveraging frosted-glass backdrops, vibrant colorful underlays, and microscopic highlight borders. This styling technique, known as glassmorphism, elevates standard cards to feel premium and dimensional.',
        'Design is not just what it looks like and feels like. Design is how it works. - Steve Jobs',
        `/* Glassmorphism CSS Utility */
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}`,
        'When implementing glassmorphism, remember to maintain high readability. Always combine low opacity background colors with solid high-contrast text and utilize fallback colors for browsers that do not support backdrop-filters.'
      )
    },
    {
      title: 'Optimizing Database Queries with Prisma 7',
      slug: 'optimizing-database-queries-prisma-7',
      excerpt: 'A deep-dive analysis into using driver adapters, connection pooling, and optimizing relational lookups in modern backend environments.',
      coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200',
      published: true,
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      authorId: admin.id,
      categoryId: categories[2].id, // SaaS
      tags: { connect: [{ id: tags[3].id }, { id: tags[5].id }] },
      content: createTipTapContent(
        'Optimizing Database Queries with Prisma 7',
        'Prisma 7 has introduced a major paradigm shift by moving database connections from a Rust engine binary to native JavaScript driver adapters. This change reduces package sizes and improves cold-start times dramatically in serverless functions.',
        'Simple is better than complex. Complex is better than complicated. - Python Zen',
        `// Initialize Prisma 7 with a pg Pool adapter
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });`,
        'In addition to driver adapters, make sure to index keys used in frequent filters, write specific queries using select instead of returning entire models, and manage your connections diligently using global wrappers in development.'
      )
    },
    {
      title: 'The Blueprint of a 10x Productive Software Developer',
      slug: 'blueprint-10x-productive-software-developer',
      excerpt: 'Tips and strategies to eliminate context switching, structure deep work sessions, and master keyboard-driven workflows.',
      coverImage: 'https://images.unsplash.com/photo-1484417894907-623942c8ea29?w=1200',
      published: true,
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      authorId: employee.id,
      categoryId: categories[3].id, // Productivity
      tags: { connect: [{ id: tags[4].id }] },
      content: createTipTapContent(
        'The Blueprint of a 10x Productive Software Developer',
        'Productivity in software engineering is rarely about typing faster. Instead, it is about maintaining concentration, mastering developer tools, and structuring logical deep work periods. Reducing the friction to start coding pays massive dividends.',
        'Focus is a matter of deciding what things you are not going to do. - John Carmack',
        `// Keyboard shortcut configuration example
const shortcuts = {
  findFile: 'Ctrl + P',
  commandPalette: 'Ctrl + Shift + P',
  toggleSidebar: 'Ctrl + B'
};`,
        'By investing time in setting up custom terminal aliases, learning keybindings in VS Code, and establishing structured blocks of time for focused development, you can increase your output while reducing mental fatigue.'
      )
    },
    {
      title: 'Draft: The Future of Developer Content Platforms',
      slug: 'future-developer-content-platforms',
      excerpt: 'Unpublished draft exploring how interactive code environments, markdown, and video elements will shape developer documentation.',
      coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1200',
      published: false,
      authorId: employee.id,
      categoryId: categories[0].id, // Tech
      tags: { connect: [{ id: tags[0].id }] },
      content: createTipTapContent(
        'The Future of Developer Content Platforms',
        'Developer-targeted websites require a higher standard of visual presentation and utility. Standard text documents are no longer enough; developers expect live previews, copy-pasteable blocks, and deep linking features.',
        'Documentation is the love letter you write to your future self. - Unknown',
        `// Code block placeholder
const futurePlatform = true;`,
        'We will explore how headless rich text editors (like TipTap) allow platforms to customize component embedding, making documents dynamic and interactive.'
      )
    }
  ];

  for (const blog of blogsData) {
    const createdBlog = await prisma.blog.create({ data: blog });
    console.log(`Created blog: ${createdBlog.title}`);
    
    // Seed views, likes, and comments for the published blogs
    if (createdBlog.published) {
      await prisma.view.create({ data: { blogId: createdBlog.id, ip: '127.0.0.1' } });
      await prisma.view.create({ data: { blogId: createdBlog.id, ip: '192.168.1.1' } });
      
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
