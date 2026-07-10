import { ApolloServer, gql } from 'apollo-server-express';
import express from 'express';

// 1. Mock Database Data
const doctorsData = [
  { id: '1', name: 'Dr. Smith', specialty: 'Cardiology', availableSlots: ['09:00 AM', '11:00 AM'] },
  { id: '2', name: 'Dr. Jones', specialty: 'Pediatrics', availableSlots: ['02:00 PM', '04:00 PM'] },
];

const appointmentsData = [];

// 2. GraphQL Schema Definition (Type Definitions)
const typeDefs = gql`
  type Doctor {
    id: ID!
    name: String!
    specialty: String!
    availableSlots: [String!]!
  }

  type Appointment {
    id: ID!
    doctorName: String!
    patientName: String!
    time: String!
  }

  type Query {
    doctors: [Doctor!]!
    appointments: [Appointment!]!
  }

  type Mutation {
    bookAppointment(doctorId: ID!, patientName: String!, time: String!): Appointment!
  }
`;

// 3. GraphQL Resolvers
const resolvers = {
  Query: {
    doctors: () => doctorsData,
    appointments: () => appointmentsData,
  },
  Mutation: {
    bookAppointment: (_, { doctorId, patientName, time }) => {
      const doctor = doctorsData.find(d => d.id === doctorId);
      if (!doctor) throw new Error("Doctor not found");

      const newAppointment = {
        id: String(appointmentsData.length + 1),
        doctorName: doctor.name,
        patientName,
        time
      };

      appointmentsData.push(newAppointment);
      return newAppointment;
    }
  }
};

// 4. Start the Express and Apollo Server
async function startServer() {
  const app = express();
  const server = new ApolloServer({ typeDefs, resolvers });

  await server.start();
  server.applyMiddleware({ app });

  const PORT = 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Hospital API ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();