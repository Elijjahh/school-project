<script setup lang="ts">
definePageMeta({
  layout: 'profile',
});

const { user } = useUserSession();
const route = useRoute();
const courseId = Number(route.params.courseId);

if (!user.value?.id) {
  throw createError({
    statusCode: 401,
    statusMessage: 'Unauthorized',
  });
}

const { data: courseData } = useFetch(`/api/courses/${courseId}`);
const courseProgressRef = ref();
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div class="space-y-8">
        <!-- Breadcrumbs -->
        <UIBreadcrumb>
          <UIBreadcrumbList>
            <UIBreadcrumbItem>
              <UIBreadcrumbLink href="/app/courses">Курсы</UIBreadcrumbLink>
            </UIBreadcrumbItem>
            <UIBreadcrumbSeparator />
            <UIBreadcrumbItem>
              <UIBreadcrumbLink :href="`/app/courses/${courseId}`">{{
                courseData?.title || 'Курс'
              }}</UIBreadcrumbLink>
            </UIBreadcrumbItem>
            <UIBreadcrumbSeparator />
            <UIBreadcrumbItem>
              <UIBreadcrumbPage>Прогресс</UIBreadcrumbPage>
            </UIBreadcrumbItem>
          </UIBreadcrumbList>
        </UIBreadcrumb>

        <!-- Header -->
        <div class="space-y-2">
          <h1 class="text-3xl font-bold tracking-tight text-gray-900">Прогресс курса</h1>
          <p class="text-gray-600">{{ courseData?.title || 'Курс' }}</p>
        </div>

        <!-- Course Progress with Details -->
        <CourseProgress
          v-if="user?.id"
          ref="courseProgressRef"
          :courseId="courseId"
          :userId="user.id"
          :showDetails="true"
        />
      </div>
    </div>
  </div>
</template>
