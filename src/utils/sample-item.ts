export const SampleItemResponse = {
  context: {
    domain: 'onest:learning-experiences',
    transaction_id: '9a007efb-07a3-44f8-82c1-a95e21371891',
  },
  message: {
    catalog: {
      descriptor: {
        name: 'Catalog for English courses',
      },
      providers: [
        {
          id: 'INFOSYS',
          descriptor: {
            name: 'Infosys Springboard',
            short_desc: 'Infosys Springboard Digital literacy program',
            images: [
              {
                url: 'https://infyspringboard.onwingspan.com/web/assets/images/infosysheadstart/app_logos/landing-new.png',
                size_type: 'sm',
              },
            ],
          },
          categories: [
            {
              id: 'LANGUAGE-COURSES',
              descriptor: {
                code: 'LANGUAGE-COURSES',
                name: 'Language Courses',
              },
            },
            {
              id: 'SKILL-DEVELOPMENT-COURSES',
              descriptor: {
                code: 'SKILL-DEVELOPMENT-COURSES',
                name: 'Skill development Courses',
              },
            },
            {
              id: 'TECHNICAL-COURSES',
              descriptor: {
                code: 'TECHNICAL-COURSES',
                name: 'Technical Courses',
              },
            },
            {
              id: 'SELF-PACED-COURSES',
              descriptor: {
                code: 'SELF-PACED-COURSES',
                name: 'Self Paced Courses',
              },
            },
          ],
          fulfillments: [
            {
              id: '1',
              type: 'ONLINE',
              tracking: false,
            },
            {
              id: '2',
              type: 'IN-PERSON',
              tracking: false,
            },
            {
              id: '3',
              type: 'HYBRID',
              tracking: false,
            },
          ],
          items: [
            {
              id: 'd4975df5-b18c-4772-80ad-368669856d52',
              quantity: {
                maximum: {
                  count: {
                    $numberInt: '1',
                  },
                },
              },
              descriptor: {
                name: 'Everyday Conversational English',
                short_desc:
                  "Elevate your daily conversations with confidence through our 'Everyday Conversational English' course.",
                long_desc:
                  "<p><strong>Course Overview:</strong><br>Welcome to 'Everyday Conversational English,' your key to mastering essential language skills for real-life communication. Tailored for all levels, this course offers:</p><ol><li><strong>Practical Vocabulary:</strong><br>Learn everyday expressions for seamless communication.</li><li><strong>Interactive Role-Playing:</strong><br>Apply knowledge through immersive exercises for real-world scenarios.</li><li><strong>Cultural Insights:</strong><br>Gain cultural nuances to connect authentically in conversations.</li><li><strong>Real-Life Scenarios:</strong><br>Navigate common situations with confidence-building tools.</li><li><strong>Quiz Assessments:</strong><br>Reinforce learning through quizzes for ongoing skill development.</li></ol><p><strong>Why Take This Course:</strong></p><ul><li><strong>Personal & Professional Growth:</strong><br>Enhance personal connections and gain a professional edge.</li><li><strong>Cultural Fluency:</strong><br>Understand and engage with diverse cultures confidently.</li><li><strong>Life-Long Skill:</strong><br>Develop a valuable skill applicable across various life stages.</li></ul><p>Join 'Everyday Conversational English' and elevate your communication for meaningful connections and success.</p>",
                images: [
                  {
                    url: 'https://infyspringboard.onwingspan.com/web/assets/images/infosysheadstart/everyday-conversational-english.png',
                  },
                ],
                media: [
                  {
                    url: 'https://infyspringboard.onwingspan.com/web/courses/infosysheadstart/everyday-conversational-english/preview/',
                  },
                ],
              },
              creator: {
                descriptor: {
                  name: 'Prof. Emma Sullivan',
                  short_desc:
                    'Experienced language educator dedicated to fostering practical conversational skills and cultural fluency',
                  long_desc:
                    "Hello, I'm Prof. Emma Sullivan, your guide in 'Everyday Conversational English.' With over a decade of experience, I'm here to make language learning dynamic and culturally enriching. Let's explore practical communication skills together for personal and professional growth. Join me on this exciting journey!",
                  images: [
                    {
                      url: 'https://infyspringboard.onwingspan.com/web/assets/images/infosysheadstart/ins/1.png',
                    },
                  ],
                },
              },
              price: {
                currency: 'INR',
                value: '0',
              },
              category_ids: ['LANGUAGE-COURSES', 'SELF-PACED-COURSES'],
              fulfillment_ids: ['1'],
              rating: '4.5',
              rateable: true,
              tags: [
                {
                  descriptor: {
                    code: 'content-metadata',
                    name: 'Content metadata',
                  },
                  list: [
                    {
                      descriptor: {
                        code: 'learner-level',
                        name: 'Learner level',
                      },
                      value: 'Beginner',
                    },
                    {
                      descriptor: {
                        code: 'learning-objective',
                        name: 'Learning objective',
                      },
                      value:
                        'By the end of the course, learners will confidently navigate everyday conversations, demonstrating improved fluency, cultural awareness, and effective communication skills.',
                    },
                    {
                      descriptor: {
                        code: 'prerequisite',
                        name: 'Prerequisite',
                      },
                      value: 'Should have a basic understanding of English',
                    },
                    {
                      descriptor: {
                        code: 'prerequisite',
                        name: 'Prerequisite',
                      },
                      value: 'Access to a computer or internet to access the course online',
                    },
                    {
                      descriptor: {
                        code: 'lang-code',
                        name: 'Language code',
                      },
                      value: 'en',
                    },
                    {
                      descriptor: {
                        code: 'course-duration',
                        name: 'Course duration',
                      },
                      value: 'P20H',
                    },
                  ],
                  display: true,
                },
              ],
            },
          ],
        },
      ],
    },
  },
};