"use server";

import { createClient } from "@/lib/supabase/server";

export interface Course {
    id: string;
    title: string;
    description: string;
    level: string;
    total_lessons: number;
    xp_reward: number;
    icon: string;
    estimated_time: string;
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
    const supabase = await createClient();
    const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: true });

    if (error) {
        console.error("Error fetching courses:", error);
        return [];
    }
    return data || [];
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

    if (error) return { error: error.message };
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

    const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
    if (courseError) return null;

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

    const { data: course, error: cErr } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

    if (cErr || !course) return { error: "Course not found" };

    if (enrollment.status === 'completed') return { success: true, isCompleted: true };

    const newCompleted = enrollment.completed_lessons + 1;
    const isCompleted = newCompleted >= course.total_lessons;
    const progress = Math.min(100, Math.round((newCompleted / course.total_lessons) * 100));

    const { error: updateErr } = await supabase
        .from('enrollments')
        .update({
            completed_lessons: Math.min(newCompleted, course.total_lessons),
            progress,
            status: isCompleted ? 'completed' : 'enrolled'
        })
        .eq('id', enrollment.id);

    if (isCompleted) {
        const { data: profile } = await supabase.from('profiles').select('knowledge_xp').eq('id', user.id).single();
        if (profile) {
            await supabase.from('profiles').update({
                knowledge_xp: (profile.knowledge_xp || 0) + course.xp_reward
            }).eq('id', user.id);
        }
    }

    if (updateErr) return { error: updateErr.message };

    return { success: true, isCompleted, xp_reward: isCompleted ? course.xp_reward : 0 };
}
