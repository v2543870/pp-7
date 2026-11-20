const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017/student_db";

async function runMongoDBSetup() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ 1. Успішне підключення до MongoDB Server.");

    const db = client.db("student_db");
    console.log(`✅ 2. База даних '${db.databaseName}' обрана.`);

    await createAndInsertData(db);

    console.log("\n=== Завдання 1: Читання ===");
    await findAllStudents(db);
    await findFrontendStudents(db);

    console.log("\n=== Завдання 2: Оновлення ===");
    await updateSingleGroup(db);
    await updateStudentsAge(db);

    console.log("\n=== Завдання 3: Видалення ===");
    await deleteOneStudent(db);
    await dropCoursesCollection(db);
  } catch (error) {
    console.error("❌ Виникла помилка підключення/операції:", error.message);
  } finally {
    await client.close();
    console.log("--- З'єднання закрито. Роботу завершено. ---");
  }
}

async function createAndInsertData(db) {
  const collectionName = "groups";

  try {
    await db.createCollection(collectionName);
    console.log(`✅ 3. Колекція '${collectionName}' успішно створена.`);
  } catch (e) {
    if (e.code === 48) {
      console.log(`✅ 3. Колекція '${collectionName}' вже існує.`);
    } else {
      throw e;
    }
  }

  await insertInitialData(db);
}

async function insertInitialData(db) {
  const groupsCollection = db.collection("groups");

  const document = {
    name: "WEB-21",
    curator: "Mr. Smith",
    students_count: 28,
  };

  const result = await groupsCollection.insertOne(document);
  console.log(`✅ 4. Документ вставлено. ID: ${result.insertedId}`);

  await insertMultipleData(db);
}

async function insertMultipleData(db) {
  const studentsCollection = db.collection("students");

  const documents = [
    { name: "Олена", specialty: "Frontend", group: "WEB-21" },
    { name: "Микола", specialty: "Backend", group: "WEB-21" },
    { name: "Ірина", specialty: "QA", group: "QA-22" },
  ];

  const result = await studentsCollection.insertMany(documents);
  console.log(`✅ 5. Вставлено ${result.insertedCount} нових студентів.`);
}

async function findAllStudents(db) {
  const students = await db.collection("students").find({}).toArray();
  console.log(`📋 Усі студенти (${students.length}):`);
  console.log(students);
}

async function findFrontendStudents(db) {
  const students = await db
    .collection("students")
    .find({ specialty: "Frontend" })
    .toArray();
  console.log(`🎨 Студенти Frontend (${students.length}):`);
  console.log(students);
}

async function updateSingleGroup(db) {
  const result = await db
    .collection("groups")
    .updateOne({ name: "WEB-21" }, { $set: { curator: "Dr. Black" } });
  console.log(`✏️ Змінено документів (groups): ${result.modifiedCount}`);
}

async function updateStudentsAge(db) {
  const result = await db
    .collection("students")
    .updateMany({}, { $set: { age: 20 } });
  console.log(`✏️ Змінено документів (students): ${result.modifiedCount}`);
}

async function deleteOneStudent(db) {
  const result = await db.collection("students").deleteOne({ name: "Ірина" });
  console.log(`🗑️ Видалено документів: ${result.deletedCount}`);
}

async function dropCoursesCollection(db) {
  try {
    const dropped = await db.collection("courses").drop();
    if (dropped) {
      console.log("🗑️ Колекцію 'courses' видалено.");
    } else {
      console.log("ℹ️ Колекції 'courses' не існує, нічого видаляти.");
    }
  } catch (e) {
    if (e.code === 26) {
      console.log("ℹ️ Колекції 'courses' не існує, нічого видаляти.");
    } else {
      throw e;
    }
  }
}

runMongoDBSetup();
