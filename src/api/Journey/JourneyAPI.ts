import type { ApiResult } from "../client";
import type { JourneyMilestone } from "../../type/journey";

/** Dummy data until the backend team ships the real GetMyJourney endpoint — same ApiResult
 * envelope real endpoints use, so swapping in the live call later is a one-line change. */
const DUMMY_JOURNEY: JourneyMilestone[] = [
  { milestoneId: 1, category: "Joined the Company", title: "Joined NewWorld as Software Engineer", description: "Started the journey with the Engineering team.", date: "Jul 2022" },
  { milestoneId: 2, category: "Project Win", title: "Delivered the Ops Automation Suite", description: "Led the rollout that cut manual processing time in half.", date: "May 2023" },
  { milestoneId: 3, category: "Mentorship", title: "Started mentoring 2 new joiners", description: "Onboarded and guided new team members.", date: "Jan 2024" },
  { milestoneId: 4, category: "Recognition", title: "Awarded Employee of the Quarter", description: "Recognized for consistent delivery and teamwork.", date: "Sep 2024" },
  { milestoneId: 5, category: "Promotion", title: "Promoted to Senior Software Engineer", description: "Took on additional ownership across the platform.", date: "Mar 2025" },
];

export async function getMyJourney(): Promise<ApiResult<JourneyMilestone[]>> {
  return { success: true, data: DUMMY_JOURNEY, message: "OK", status: 200 };
}
