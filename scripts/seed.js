const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const genres = [
  'Fantasy',
  'Science Fiction',
  'Mystery',
  'Romance',
  'Horror',
  'Thriller',
  'Adventure',
  'Historical Fiction',
  'Young Adult',
  'Action',
  'Comedy',
  'Drama',
  'Dystopian',
  'Poetry',
  'Slice of Life',
  'Supernatural',
  'Urban Fantasy',
  'Western',
  'Crime',
  'Suspense'
];

async function main() {
  console.log('Starting to seed genres...');
  
  let createdCount = 0;
  let existingCount = 0;
  
  for (const genreName of genres) {
    const existingGenre = await prisma.genre.findUnique({
      where: {
        name: genreName
      }
    });
    
    if (!existingGenre) {
      await prisma.genre.create({
        data: {
          name: genreName
        }
      });
      createdCount++;
      console.log(`Created genre: ${genreName}`);
    } else {
      existingCount++;
      console.log(`Genre already exists: ${genreName}`);
    }
  }
  
  console.log(`Seeding completed! Created ${createdCount} genres, ${existingCount} already existed.`);
}

main()
  .catch((e) => {
    console.error('Error seeding genres:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 