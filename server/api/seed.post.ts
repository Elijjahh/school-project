import { fakerRU as faker } from '@faker-js/faker';
import * as schema from '~/drizzle/schema';
import { reset } from 'drizzle-seed';

export default defineEventHandler(async (_event) => {
  try {
    console.log('🌱 Starting seeding...');
    const db = useDrizzle();
    await reset(db, schema);

    // Create admin user
    const [_admin] = await db
      .insert(tables.users)
      .values({
        username: 'admin',
        email: 'admin@example.com',
        password: await hashPassword('admin123'),
        firstname: 'Администратор',
        lastname: 'Системы',
        role: 'admin',
      })
      .returning();

    // Create teachers
    const teachers = await Promise.all(
      Array.from({ length: 5 }, async (_, index) => {
        const [teacher] = await db
          .insert(tables.users)
          .values({
            username: `teacher${index + 1}`,
            email: `teacher${index + 1}@example.com`,
            password: await hashPassword('teacher123'),
            firstname: faker.person.firstName(),
            lastname: faker.person.lastName(),
            role: 'teacher',
          })
          .returning();
        return teacher;
      }),
    );

    // Create students
    const students = await Promise.all(
      Array.from({ length: 20 }, async (_, index) => {
        const [student] = await db
          .insert(tables.users)
          .values({
            username: `student${index + 1}`,
            email: `student${index + 1}@example.com`,
            password: await hashPassword('student123'),
            firstname: faker.person.firstName(),
            lastname: faker.person.lastName(),
            role: 'student',
          })
          .returning();
        return student;
      }),
    );

    // Create courses
    const courseTitles = [
      'Основы программирования на Python',
      'Веб-разработка с нуля',
      'Алгоритмы и структуры данных',
      'Базы данных и SQL',
      'JavaScript для начинающих',
      'React и современный фронтенд',
      'Node.js и серверная разработка',
      'Мобильная разработка на Flutter',
      'Машинное обучение и анализ данных',
      'DevOps и CI/CD',
    ];

    const createdCourses = await Promise.all(
      courseTitles.map(async (title) => {
        const [course] = await db
          .insert(tables.courses)
          .values({
            title,
            description: faker.lorem.paragraphs(2),
            creatorId: faker.helpers.arrayElement(teachers).id,
          })
          .returning();
        return course;
      }),
    );

    // Create course participations and progress
    for (const course of createdCourses) {
      const courseStudents = faker.helpers.arrayElements(students, { min: 5, max: 15 });

      for (const student of courseStudents) {
        const [participation] = await db
          .insert(tables.coursesParticipations)
          .values({
            userId: student.id,
            courseId: course.id,
          })
          .returning();

        // Create course progress
        await db.insert(tables.coursesProgress).values({
          courseId: course.id,
          participationId: participation.id,
          finished: faker.datatype.boolean(),
        });

        // Create modules
        const moduleCount = faker.number.int({ min: 3, max: 8 });
        for (let i = 0; i < moduleCount; i++) {
          const [module] = await db
            .insert(tables.modules)
            .values({
              courseId: course.id,
              title: `Модуль ${i + 1}: ${faker.lorem.words(3)}`,
              description: faker.lorem.paragraph(),
              order: i + 1,
            })
            .returning();

          // Create module progress
          await db.insert(tables.modulesProgress).values({
            moduleId: module.id,
            participationId: participation.id,
            finished: faker.datatype.boolean(),
          });

          // Create lessons
          const lessonCount = faker.number.int({ min: 3, max: 6 });
          for (let j = 0; j < lessonCount; j++) {
            const [lesson] = await db
              .insert(tables.lessons)
              .values({
                moduleId: module.id,
                title: `Урок ${j + 1}: ${faker.lorem.words(3)}`,
                content: faker.lorem.paragraphs(3),
                order: j + 1,
              })
              .returning();

            // Create lesson progress
            await db.insert(tables.lessonsProgress).values({
              lessonId: lesson.id,
              participationId: participation.id,
              finished: faker.datatype.boolean(),
            });

            // Create test
            const [test] = await db
              .insert(tables.tests)
              .values({
                lessonId: lesson.id,
                maxAttempts: faker.number.int({ min: 1, max: 3 }),
              })
              .returning();

            // Create test attempt
            if (faker.datatype.boolean()) {
              const [_attempt] = await db
                .insert(tables.testAttempts)
                .values({
                  testId: test.id,
                  datetime: new Date(),
                })
                .returning();

              // Create questions
              const questionCount = faker.number.int({ min: 5, max: 10 });
              for (let k = 0; k < questionCount; k++) {
                const [question] = await db
                  .insert(tables.questions)
                  .values({
                    testId: test.id,
                    text: faker.lorem.sentence() + '?',
                  })
                  .returning();

                // Create answers
                const answerCount = faker.number.int({ min: 2, max: 4 });
                const correctAnswerIndex = faker.number.int({ min: 0, max: answerCount - 1 });

                for (let l = 0; l < answerCount; l++) {
                  await db.insert(tables.answers).values({
                    questionId: question.id,
                    text: faker.lorem.sentence(),
                    correct: l === correctAnswerIndex,
                  });
                }
              }
            }
          }
        }
      }
    }

    console.log('✅ Seeding completed!');
    return {
      success: true,
      message: 'Database seeded successfully',
    };
  } catch (error) {
    console.error('❌ Seeding failed!');
    console.error(error);
    throw createError({
      statusCode: 500,
      message: 'Failed to seed database',
    });
  }
});
