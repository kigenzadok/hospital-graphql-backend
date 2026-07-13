import 'dotenv/config'; // Loads variables from .env right away
import { ApolloServer, gql } from 'apollo-server-express';
import express from 'express';
import mongoose from 'mongoose';

// Connect to Cloud MongoDB Atlas using the environment variable
const MONGODB_URI = process.env.MONGODB_URI; 

if (!MONGODB_URI) {
  console.error("❌ Critical: MONGODB_URI environment variable is missing.");
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('☁️ Successfully connected to Cloud MongoDB Atlas!'))
  .catch(err => console.error('❌ MongoDB Atlas connection error:', err));

// ... (Keep the rest of your Schema, Models, Resolvers, and startServer functions identical!)
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