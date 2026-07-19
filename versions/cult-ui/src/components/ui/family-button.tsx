"use client"

import { type FC, type ReactNode, useState } from "react"
import { PlusIcon, XIcon } from "lucide-react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

const CONTAINER_SIZE = 200

interface FamilyButtonProps {
  children: React.ReactNode
  expandLabel?: string
  collapseLabel?: string
}

const FamilyButton: React.FC<FamilyButtonProps> = ({
  children,
  expandLabel = "Open actions",
  collapseLabel = "Close actions",
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const toggleExpand = () => setIsExpanded(!isExpanded)

  return (
    <div
      className={cn(
        "rounded-[24px] border border-black/10 shadow-sm dark:border-border",
        "bg-gradient-to-b from-neutral-100 to-white dark:from-neutral-900 dark:to-black",
        isExpanded
          ? "w-[204px] bg-gradient-to-b dark:from-neutral-900 dark:to-neutral-900/80"
          : "dark:from-neutral-900 dark:to-neutral-950 bg-gradient-to-b"
      )}
    >
      <div className="rounded-[23px] border border-black/10 dark:border-neutral-900/80">
        <div className="rounded-[22px] border dark:border-neutral-800 border-white/50">
          <div className="rounded-[21px] border border-neutral-950/20 flex items-center justify-center">
            <FamilyButtonContainer
              isExpanded={isExpanded}
              toggleExpand={toggleExpand}
              expandLabel={expandLabel}
              collapseLabel={collapseLabel}
            >
              {isExpanded ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: {
                      delay: 0.3,
                      duration: 0.4,
                      ease: "easeOut",
                    },
                  }}
                >
                  {children}
                </motion.div>
              ) : null}
            </FamilyButtonContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

interface FamilyButtonContainerProps {
  isExpanded: boolean
  toggleExpand: () => void
  expandLabel: string
  collapseLabel: string
  children: ReactNode
}

const FamilyButtonContainer: FC<FamilyButtonContainerProps> = ({
  isExpanded,
  toggleExpand,
  expandLabel,
  collapseLabel,
  children,
}) => {
  return (
    <motion.div
      className={cn(
        "relative border-black/5 dark:border-white/10 border shadow-lg flex flex-col space-y-1 items-center text-foreground cursor-pointer z-10",
        !isExpanded
          ? "bg-gradient-to-b from-neutral-100 to-white dark:from-neutral-700 dark:to-neutral-800/80"
          : ""
      )}
      layoutRoot
      layout
      initial={{ borderRadius: 21, width: "4rem", height: "4rem" }}
      animate={
        isExpanded
          ? {
              borderRadius: 20,
              width: CONTAINER_SIZE,
              height: CONTAINER_SIZE + 50,

              transition: {
                type: "spring",
                damping: 25,
                stiffness: 400,
                when: "beforeChildren",
              },
            }
          : {
              borderRadius: 21,
              width: "4rem",
              height: "4rem",
            }
      }
    >
      {children}

      <motion.div
        className="absolute"
        initial={{ x: "-50%" }}
        animate={{
          x: isExpanded ? "0%" : "-50%",
          transition: {
            type: "tween",
            ease: "easeOut",
            duration: 0.3,
          },
        }}
        style={{
          left: isExpanded ? "" : "50%",
          bottom: 6,
        }}
      >
        {isExpanded ? (
          <motion.button
            type="button"
            aria-label={collapseLabel}
            className="p-[10px] group bg-white/80 dark:bg-black/50 border border-border hover:border-neutral-400 dark:hover:border-neutral-500 text-foreground rounded-full shadow-2xl transition-colors duration-300"
            onClick={toggleExpand}
            layoutId="expand-toggle"
            initial={false}
            animate={{
              rotate: -360,
              transition: {
                duration: 0.4,
              },
            }}
          >
            <XIcon
              className={cn(
                "h-7 w-7 text-muted-foreground group-hover:text-foreground transition-colors duration-200"
              )}
            />
          </motion.button>
        ) : (
          <motion.button
            type="button"
            aria-label={expandLabel}
            className={cn(
              "p-[10px] group bg-neutral-200 dark:bg-accent text-accent-foreground border border-black/10 shadow-2xl transition-colors duration-200"
            )}
            style={{ borderRadius: 24 }}
            onClick={toggleExpand}
            layoutId="expand-toggle"
            initial={{ rotate: 180 }}
            animate={{
              rotate: -180,
              transition: {
                duration: 0.4,
              },
            }}
          >
            <PlusIcon className="h-7 w-7 text-black dark:text-accent-foreground" />
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  )
}

export { FamilyButton }
export default FamilyButton
