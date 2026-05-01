"use client"

import { ReactNode } from "react"
import { MapPin, Users, ExternalLink, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface JobCardProps {
  companyName?: string
  companyLogo?: string
  companyLogoAlt?: string
  companyType?: string
  companySize?: string
  jobType?: string
  industry?: string
  salaryRange?: string
  remoteWork?: boolean
  title?: string
  companyWebsite?: string
  location?: string
  createdDate?: string
  ctc?: string
  experienceRange?: string
  openings?: number
  skillsRequired?: string[]
  actions?: ReactNode
}

export default function JobCard({
  companyName,
  companyLogo,
  companyLogoAlt,
  companyType,
  companySize,
  jobType,
  industry,
  salaryRange,
  remoteWork,
  title,
  companyWebsite,
  location,
  createdDate,
  ctc,
  experienceRange,
  openings,
  skillsRequired,
  actions,
}: JobCardProps) {
  const showCompanyLogo = companyLogo && companyLogo !== "hgvuiihukb.com"
  const logoLetter = companyName?.[0]?.toUpperCase() || "J"

  return (
    <div className="group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-lg dark:hover:shadow-xl transition-all duration-300">
      <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative">
              {showCompanyLogo ? (
                <img
                  src={companyLogo}
                  alt={companyLogoAlt || companyName || "Company logo"}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover flex-shrink-0"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                    const fallback = target.nextElementSibling as HTMLElement
                    if (fallback) fallback.style.display = "flex"
                  }}
                />
              ) : null}
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0"
                style={{ display: showCompanyLogo ? "none" : "flex" }}
              >
                <span className="text-white font-bold text-lg">{logoLetter}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                {companyName || "Company"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                {companyType || "Business"} • {companySize || "Size"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="flex-shrink-0 text-gray-400 hover:text-red-500">
            <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs sm:text-sm font-medium capitalize">
            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            {jobType?.replace("_", " ") || "Full-time"}
          </span>
          <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-xs sm:text-sm font-medium">
            💼 {industry || "Technology"}
          </span>
          <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs sm:text-sm font-medium">
            💰 {salaryRange || "N/A"}
          </span>
          {remoteWork && (
            <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs sm:text-sm font-medium">
              🌐 Remote
            </span>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">{title || "Job Title"}</h4>
            {companyWebsite && (
              <a href={companyWebsite} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 text-gray-400 hover:text-blue-500 transition-colors flex-shrink-0" />
              </a>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
              {location || "Location"}
            </span>
            <span>•</span>
            {remoteWork && (
              <>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">🌐 Remote</span>
                <span>•</span>
              </>
            )}
            <span className="text-gray-500 dark:text-gray-500">{createdDate || "Recently"}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="text-xs">
            <p className="text-gray-500 dark:text-gray-400 font-medium">CTC</p>
            <p className="text-gray-900 dark:text-white font-semibold">{ctc || "N/A"}</p>
          </div>
          <div className="text-xs">
            <p className="text-gray-500 dark:text-gray-400 font-medium">Experience</p>
            <p className="text-gray-900 dark:text-white font-semibold">{experienceRange || "N/A"}</p>
          </div>
          <div className="text-xs">
            <p className="text-gray-500 dark:text-gray-400 font-medium">Openings</p>
            <p className="text-gray-900 dark:text-white font-semibold">{openings ?? 0}</p>
          </div>
        </div>

        {skillsRequired && skillsRequired.length > 0 && (
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Required Skills</p>
            <div className="flex flex-wrap gap-2">
              {skillsRequired.slice(0, 5).map((skill, index) => (
                <span key={index} className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
                  {skill}
                </span>
              ))}
              {skillsRequired.length > 5 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">+{skillsRequired.length - 5} more</span>
              )}
            </div>
          </div>
        )}

        {actions}
      </div>
    </div>
  )
}
