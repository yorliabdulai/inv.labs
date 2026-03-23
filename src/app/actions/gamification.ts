"use server";

import { createClient } from "@/lib/supabase/server";
import { ACADEMY_COURSES, CourseData } from "@/data/academy";

export interface Lesson {
    id: string;
    title: string;
    description: string;
    youtubeId: string;
    duration: string;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    level: string;
    total_lessons: number;
    xp_reward: number;
    icon: string;
    estimated_time: string;
    lessons?: Lesson[];
}

export interface Enrollment {
    id: string;
    course_id: string;
    progress: number;
    completed_lessons: number;
    status: string;
    course?: Course;
}

export async function getCourses(): Promise<Course[]> {
    // We use the hardcoded courses as the source of truth for content
    return ACADEMY_COURSES.map(c => ({
        id: c.id,
        title: c.title,
        description: c.description,
        level: c.level,
        total_lessons: c.lessons.length,
        xp_reward: c.xpReward,
        icon: c.icon,
        estimated_time: c.estimatedTime
    }));
}

export async function getUserEnrollments(): Promise<Enrollment[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('enrollments')
        .select('*, course:courses(*)')
        .eq('user_id', user.id);

    if (error) {
        console.error("Error fetching enrollments:", error);
        return [];
    }
    return data || [];
}

export async function enrollInCourse(courseId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "User not authenticated" };

    const { error } = await supabase
        .from('enrollments')
        .insert({ user_id: user.id, course_id: courseId });

    if (error) {
        console.error("Enrollment error:", error);
        return { error: "Failed to enroll in course. Please try again later." };
    }
    return { success: true };
}

export async function getTopUsers() {
    const supabase = await createClient();
    // Assuming profiles table has knowledge_xp and full_name
    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, knowledge_xp, accreditation_level')
        .order('knowledge_xp', { ascending: false })
        .limit(10);

    if (error) {
        console.error("Error fetching top users:", error);
        return [];
    }
    return data || [];
}

export async function getCourseWithEnrollment(courseId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const staticCourse = ACADEMY_COURSES.find(c => c.id === courseId);
    if (!staticCourse) return null;

    const course: Course = {
        id: staticCourse.id,
        title: staticCourse.title,
        description: staticCourse.description,
        level: staticCourse.level,
        total_lessons: staticCourse.lessons.length,
        xp_reward: staticCourse.xpReward,
        icon: staticCourse.icon,
        estimated_time: staticCourse.estimatedTime,
        lessons: staticCourse.lessons
    };

    const { data: enrollment } = await supabase
        .from('enrollments')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .single();

    return { course, enrollment: enrollment || null };
}

export async function advanceCourseProgress(courseId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { data: enrollment, error: fetchErr } = await supabase
        .from('enrollments')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .single();

    if (fetchErr || !enrollment) return { error: "Enrollment not found" };

    const staticCourse = ACADEMY_COURSES.find(c => c.id === courseId);
    if (!staticCourse) return { error: "Course not found" };

    if (enrollment.status === 'completed') return { success: true, isCompleted: true };

    const totalLessons = staticCourse.lessons.length;
    const newCompleted = enrollment.completed_lessons + 1;
    const isCompleted = newCompleted >= totalLessons;
    const progress = Math.min(100, Math.round((newCompleted / totalLessons) * 100));

    const { error: updateErr } = await supabase
        .from('enrollments')
        .update({
            completed_lessons: Math.min(newCompleted, totalLessons),
            progress,
            status: isCompleted ? 'completed' : 'enrolled'
        })
        .eq('id', enrollment.id);

    if (isCompleted) {
        const { data: profile } = await supabase.from('profiles').select('knowledge_xp').eq('id', user.id).single();
        if (profile) {
            await supabase.from('profiles').update({
                knowledge_xp: (profile.knowledge_xp || 0) + staticCourse.xpReward
            }).eq('id', user.id);
        }
    }

    if (updateErr) {
        console.error("Course progress update error:", updateErr);
        return { error: "Failed to update course progress. Please try again later." };
    }

    return { success: true, isCompleted, xp_reward: isCompleted ? staticCourse.xpReward : 0 };
}
