// This is our sample lesson data (in a real app, this would come from a database/API)
export const lessonData = [
  {
    id: "gravity-lesson",
    title: "Physics: Understanding Gravity",
    description: "Learn about gravity, how it works, and its effects on objects in our universe.",
    sections: [
      {
        id: "introduction",
        title: "Introduction to Gravity",
        content: `
          <p>Gravity is a fundamental force that attracts objects with mass to one another. It's what keeps us on the ground and what keeps planets orbiting around stars.</p>
          <p>In 1687, Sir Isaac Newton formulated the law of universal gravitation, which states that every particle in the universe attracts every other particle with a force directly proportional to the product of their masses and inversely proportional to the square of the distance between them.</p>
        `
      },
      {
        id: "how-gravity-works",
        title: "How Gravity Works",
        content: `
          <p>The strength of gravity between two objects depends on two factors:</p>
          <ul>
            <li>The masses of the objects - larger masses create stronger gravitational pulls</li>
            <li>The distance between the objects - gravity weakens with distance</li>
          </ul>
          <p>This is represented by Newton's formula: F = G × (m₁m₂)/r²</p>
          <p>Where:</p>
          <ul>
            <li>F is the gravitational force between the masses</li>
            <li>G is the gravitational constant</li>
            <li>m₁ and m₂ are the masses of the objects</li>
            <li>r is the distance between the centers of the masses</li>
          </ul>
        `
      },
      {
        id: "gravity-in-space",
        title: "Gravity in Space",
        content: `
          <p>Gravity is responsible for:</p>
          <ul>
            <li>Keeping planets in orbit around the Sun</li>
            <li>Keeping moons in orbit around planets</li>
            <li>Forming galaxies and keeping them together</li>
            <li>The formation of stars and planets from cosmic dust</li>
          </ul>
          <p>Contrary to popular belief, astronauts in space aren't experiencing "zero gravity" - they're actually in constant free fall around the Earth, creating the sensation of weightlessness.</p>
        `
      }
    ],
    quiz: {
      id: "gravity-quiz",
      title: "Test Your Knowledge about Gravity",
      questions: [
        {
          id: "q1",
          question: "Who formulated the law of universal gravitation?",
          options: [
            { id: "q1-a", text: "Albert Einstein" },
            { id: "q1-b", text: "Sir Isaac Newton" },
            { id: "q1-c", text: "Galileo Galilei" },
            { id: "q1-d", text: "Nikola Tesla" }
          ],
          correctOptionId: "q1-b"
        },
        {
          id: "q2",
          question: "What happens to the gravitational force between two objects when the distance between them doubles?",
          options: [
            { id: "q2-a", text: "It doubles" },
            { id: "q2-b", text: "It halves" },
            { id: "q2-c", text: "It stays the same" },
            { id: "q2-d", text: "It decreases to one-fourth" }
          ],
          correctOptionId: "q2-d"
        },
        {
          id: "q3",
          question: "What is the main reason astronauts feel weightless in space?",
          options: [
            { id: "q3-a", text: "There is no gravity in space" },
            { id: "q3-b", text: "They are too far from Earth's gravity" },
            { id: "q3-c", text: "They are in constant free fall (orbit) around Earth" },
            { id: "q3-d", text: "The spaceship cancels out the effects of gravity" }
          ],
          correctOptionId: "q3-c"
        },
        {
          id: "q4",
          question: "What factors affect the strength of gravity between two objects?",
          options: [
            { id: "q4-a", text: "Only the mass of the larger object" },
            { id: "q4-b", text: "The masses of both objects and the distance between them" },
            { id: "q4-c", text: "Only the distance between the objects" },
            { id: "q4-d", text: "The colors and temperatures of the objects" }
          ],
          correctOptionId: "q4-b"
        }
      ]
    },
    interactiveElements: [
      {
        id: "gravity-simulator",
        title: "Gravity Simulator",
        description: "A placeholder for an interactive gravity simulation."
      },
      {
        id: "drag-and-drop",
        title: "Orbital Mechanics",
        description: "A placeholder for a drag-and-drop activity about orbital mechanics."
      }
    ]
  }
];
