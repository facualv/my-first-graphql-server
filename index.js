const express = require("express");
const app = express();
const _ = require("lodash");
const expressGraphQL = require("express-graphql");

const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt
} = require("graphql");

const { students, courses, grades } = require("./db");

const CourseType = new GraphQLObjectType({
  name: "Course",
  description: "Represent a Course",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLNonNull(GraphQLString) }
  })
});

const StudentType = new GraphQLObjectType({
  name: "Student",
  description: "Represent a Student",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    lastname: { type: GraphQLNonNull(GraphQLString) },
    courseId: { type: GraphQLNonNull(GraphQLInt) },
    course: {
      type: CourseType,
      resolve: (student) => {
        return courses.find((course) => course.id === student.courseId);
      }
    },
    grades: {
      type: new GraphQLList(GradeType),
      resolve: (student) =>
        grades.find((grade) => {
          grade.studentId === student.id;
        })
    }
  })
});

const GradeType = new GraphQLObjectType({
  name: "Grade",
  description: "Represent a Course",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    courseId: { type: GraphQLNonNull(GraphQLInt) },
    course: {
      type: CourseType,
      resolve: (grade) => {
        return courses.find((course) => course.id === grade.courseId);
      }
    },
    studentId: { type: GraphQLNonNull(GraphQLInt) },
    student: {
      type: StudentType,
      resolve: (grade) => {
        return students.find((student) => student.id === grade.studentId);
      }
    },
    grade: { type: GraphQLNonNull(GraphQLInt) }
  })
});

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    courses: {
      type: new GraphQLList(CourseType),
      description: "List of All Courses",
      resolve: () => courses
    },
    students: {
      type: new GraphQLList(StudentType),
      description: "List of All Student",
      resolve: () => students
    },
    grades: {
      type: new GraphQLList(GradeType),
      description: "List of All Grades",
      resolve: () => grades
    },
    course: {
      type: CourseType,
      description: "Specific Grade",
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) => courses.find((course) => course.id === args.id)
    },
    student: {
      type: StudentType,
      description: "Specific Student",
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) => students.find((student) => student.id === args.id)
    },
    grade: {
      type: GradeType,
      description: "Specific grade",
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) => grades.find((grade) => grade.id === args.id)
    }
  })
});

const RootMutationType = new GraphQLObjectType({
  name: "Mutation",
  description: "Root Mutation",
  fields: () => ({
    addCourse: {
      type: CourseType,
      description: "Add a course",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLNonNull(GraphQLString) }
      },
      resolve: (parent, args) => {
        const course = {
          id: courses.length + 1,
          name: args.name,
          description: args.description
        };
        courses.push(course);
        return course;
      }
    },
    deleteCourse: {
      type: CourseType,
      description: "Delete a course",
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) => {
        const removedCourse = _.remove(courses, (course) => {
          return args.id == course.id;
        });
        return removedCourse;
      }
    },
    addStudent: {
      type: StudentType,
      description: "Add a student",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        lastname: { type: GraphQLNonNull(GraphQLString) },
        courseId: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) => {
        const student = {
          id: students.length + 1,
          name: args.name,
          lastname: args.lastname,
          courseId: args.courseId
        };
        students.push(student);
        return student;
      }
    },
    deleteStudent: {
      type: StudentType,
      description: "Delete a student",
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) => {
        const removedStudent = _.remove(students, (student) => {
          return args.id == student.id;
        });
        return removedStudent;
      }
    },
    addGrade: {
      type: GradeType,
      description: "Add a grade",
      args: {
        grade: { type: GraphQLNonNull(GraphQLInt) },
        studentId: { type: GraphQLNonNull(GraphQLInt) },
        courseId: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) => {
        const grade = {
          id: grades.length + 1,
          grade: args.grade,
          studentId: args.studentId,
          courseId: args.courseId
        };
        grades.push(grade);
        return grade;
      }
    },
    deleteGrade: {
      type: GradeType,
      description: "Delete a grade",
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) => {
        const removedGrade = _.remove(grades, (grade) => {
          return args.id == grade.id;
        });
        return removedGrade;
      }
    }
  })
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
});

app.use(
  "/graphql",
  expressGraphQL({
    schema: schema,
    graphiql: true
  })
);

app.listen(3000, () => {
  console.log("Server running");
});
