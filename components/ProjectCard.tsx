"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface ProjectCardProps {
  slug: string;
  thumbnail: string;
  title: string;
  year: string;
  tags: string[];
  description: string;
  index: number;
  mobileThumbnail?: string;
}

export default function ProjectCard({
  slug,
  thumbnail,
  title,
  year,
  tags,
  description,
  index,
  mobileThumbnail,
}: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.12,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{
        y: -6,
        scale: 1.02,
        boxShadow: "0 24px 48px rgba(253, 137, 115, 0.18)",
        transition: { duration: 0.28, ease: "easeOut" },
      }}
    >
      <Link
        href={slug}
        className="group block bg-white rounded-2xl overflow-hidden border border-[#DDD8D1] hover:border-[#FD8973]/40 transition-colors duration-300"
      >
        {/* Thumbnail */}
        {mobileThumbnail ? (
          <picture>
            <source media="(max-width: 767px)" srcSet={mobileThumbnail} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnail}
              alt={title}
              style={{
                width: "100%",
                height: "280px",
                objectFit: "cover",
                objectPosition: "center",
                display: "block",
              }}
            />
          </picture>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt={title}
            style={{
              width: "100%",
              height: "280px",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
            }}
          />
        )}

        {/* Content */}
        <div className="p-6">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium text-[#7D8A93] bg-[#F0EEEB] px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title + year */}
          <div className="flex items-baseline justify-between gap-2 mb-3">
            <h3 className="text-base font-semibold text-[#13181B] group-hover:text-[#FD8973] transition-colors">
              {title}
            </h3>
            <span className="text-sm text-[#7D8A93] shrink-0">{year}</span>
          </div>

          <p className="text-sm text-[#2D3436] leading-relaxed">{description}</p>

          <div className="flex items-center gap-2 mt-5 text-sm font-semibold text-[#13181B] group-hover:text-[#FD8973] transition-colors">
            View project
            <span className="group-hover:translate-x-1 transition-transform duration-200">
              →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
