import { config } from "dotenv";
config({ path: ".env.local" });
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../src/models/User";
import { Restaurant } from "../src/models/Restaurant";
import { Menu } from "../src/models/Menu";
import { Order } from "../src/models/Order";
import { Queue } from "../src/models/Queue";
import { Notification } from "../src/models/Notification";

const IMAGES = {
  paNee: "https://lh3.googleusercontent.com/aida-public/AB6AXuA367ajmnSSmN3t0e6ec8L-t7DYhV1Tfezau3agwILcehoHwODVkpPTOP5RKb-Pjkc-4MCb3g9oMyYkSYBYD_8luNVCqdy7nihfHcvH8cWXmJ2NeLtSZG73Cn-gOOWo3C73PAH80tWzZw-xa57tJIRoJF-8c5aoGZ4kxXBMMvdaiqZWkWldEyNOvmU6eZSGmrkL2LWkv3JWpmXJ-8JZG2moEhMFWBijH6T4KcKtjSOedqTnxfbPNdO0Pw",
  jaeMuay: "https://lh3.googleusercontent.com/aida-public/AB6AXuDkZqFmcBDTVzgidNKZAco2863GfZ7tAfcKqZP0foLxuxvYV4eV7VsleFFo4DfTgBypp-D2GpAOTQZM4yQQnYLfcKNiLrT4IwukdWM2PdtR5j5BZ_IK4A0jaMFMRASfBY2fa3LCFL7R3hvvg799lETL0rxkrjg8uwIJ98T73FwQ-eghfHuiDUYSq_5tArX4SzJ0HOKwSSBsNE_nzSUVY9RLELmpaLEu5KBTZfyTKIAvICSDl1iKKP4pbg",
  khaoManKai: "https://lh3.googleusercontent.com/aida-public/AB6AXuCqxN6lrUAsNQ7Ad41SvJd7u3vi-fk84WHI4Oo1xngsw3coBb9WIfHJAh4kN1yDtyMQF_HY5mbFAIK6Rt0sP67thkjid9rGfQsoGqGYd00cx9tNrY-PJ-pZCc4tCFjBmzGCMHXtRDXWH05MOdaVeqj9H0xzGBZ1hMKyiZ-SLHgchL1Sj9EkamEUZkkOolafLW3yaNEeyIbDm7zybYsf1FsmLs3ACfI5egn4oUKApYPh-JGJBRADCYpuFw",
  cafe: "https://lh3.googleusercontent.com/aida-public/AB6AXuDB1SU_FbijIe67FBUyU_uIe3S_1gHvZJWxUUSaSkITpRRuyghb7d_kI_dgfFjKxsrdaF2Pq2ynqfB9m2ZGeKBH8jLSAOx7C-GVX6W1L0Pp97csv4bVyczr5K8rIuvs0qE6E59ciaGSKRXBh_i4iQzsvOPCSSXuY5334Q-PL03l_DPo6LNq6TlcGSXQUcoDbLenqPVbYCH3HtO2ivVQcDrU0x8mRdLbMv8QDKiPipng4X_iAIMCIy8xgg",
  crispyPork: "https://lh3.googleusercontent.com/aida-public/AB6AXuAFp74-5kczj6kQCvcGK4oU_noDcKpRfmScXvPRgGJ5Uplhh2PfjBOEtyLtzXk0_TYvAV3YJF7iFWc9JMRd_bxmPdQczI76JvFat6a8OLEVXF8VcpbWoU3nKYG13weG4t76ZA9Jsu76HGC9RcZwmWuOGnS1lmFnaKo1S53V0lUNwFIiIcAyBA3Rp6cO99KivboWbD8e85RXGfuWjYRNN1w0a_2sfd4T5f90GmcjvFBcUDP8aZG0Pv5d_w",
  noodle: "https://lh3.googleusercontent.com/aida-public/AB6AXuCkw0LaVcRrlATh13PuNVaeDh_8FnrvsoQnHPQSYqRdM4yZ2w4wIfJDiHELY_xgzt1GtnJfLj1anPsmPa9Kv4s3Kr4THFmwW1kmzQzOdl8WXcpECLqOAV-oV8LTp1tm7PvPLF8E909KsM7MhD9mTClGr30TZX-zRm8-Ug6_ZxfCX1PnLc5nW1X01BcDvB5bUC61cQlIbnxly-S-NjhsF1iux-rtN3oXvjppCRXfWgPkIC80eDAjk-0yjg",
  thaiTea: "https://lh3.googleusercontent.com/aida-public/AB6AXuCAOe87b0UOJS-N26zTe_1D7bwIAvnqP4RWHGKLK3IvKrVMYJsBZNCIKeogEYpoImuVbZtCDMhAFrNayLT9RInGTbbi5NtdxiE_ZWRnIwp79FYhqZQ1d4FFsQO4goBAMsCNlOB2AKI3EmXhd11dhXhmijW9u6xBgeEGjnpTakGJWMR7B2wclB8xHa8Pbw5EY7X0Q27HxGz3lsoxOixrX6VRXpIsu7eNG8VdvvZKXazTA_g1a9inYAR7LA",
};

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");

  await mongoose.connect(uri);
  console.log("Connected to MongoDB. Clearing existing data...");

  await Promise.all([
    User.deleteMany({}),
    Restaurant.deleteMany({}),
    Menu.deleteMany({}),
    Order.deleteMany({}),
    Queue.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  console.log("Seeding restaurants...");
  const [kaprao, khaoManKai, tamSang] = await Restaurant.create([
    {
      name: "ร้านกะเพรา SPU",
      description: "กะเพราจัดจ้าน ผัดสดใหม่ทุกจาน เผ็ดได้ตามสั่ง",
      image: IMAGES.paNee,
      location: "โรงอาหาร อาคาร 11",
      category: "กะเพรา/ตามสั่ง",
      isOpen: true,
      openingHours: "08:00 - 16:00",
      averagePreparationTime: 5,
      rating: 4.8,
      queuePrefix: "A",
      // Placeholder demo numbers — not real accounts. Each restaurant has its
      // own PromptPay ID so payments go straight to that restaurant.
      promptPayId: "0811111111",
    },
    {
      name: "ร้านข้าวมันไก่",
      description: "ข้าวมันไก่สูตรเบตง ไก่นุ่ม น้ำจิ้มเด็ด",
      image: IMAGES.khaoManKai,
      location: "โรงอาหาร อาคาร 11",
      category: "ข้าวมันไก่",
      isOpen: true,
      openingHours: "08:00 - 16:00",
      averagePreparationTime: 4,
      rating: 4.7,
      queuePrefix: "B",
      promptPayId: "0822222222",
    },
    {
      name: "ร้านอาหารตามสั่ง",
      description: "อาหารตามสั่งครบเครื่อง จานด่วนทันใจ",
      image: IMAGES.jaeMuay,
      location: "โรงอาหาร อาคาร 10",
      category: "ตามสั่ง",
      isOpen: true,
      openingHours: "08:00 - 16:00",
      averagePreparationTime: 6,
      rating: 4.6,
      queuePrefix: "C",
      promptPayId: "0833333333",
    },
  ]);

  console.log("Seeding menu...");
  await Menu.create([
    // ร้านกะเพรา SPU
    { restaurantId: kaprao._id, name: "กะเพราหมูสับไข่ดาว", description: "กะเพราหมูสับรสจัดจ้าน เสิร์ฟพร้อมไข่ดาว", image: IMAGES.crispyPork, price: 55, category: "จานเดียว", rating: 4.8, preparationTime: 5, popular: true },
    { restaurantId: kaprao._id, name: "กะเพราไก่ไข่ดาว", description: "กะเพราไก่สับผัดสมุนไพรสด", image: IMAGES.crispyPork, price: 50, category: "จานเดียว", rating: 4.6, preparationTime: 5, popular: true },
    { restaurantId: kaprao._id, name: "กะเพราหมูกรอบไข่ดาว", description: "หมูกรอบผัดกะเพรา เสิร์ฟร้อนๆ", image: IMAGES.crispyPork, price: 60, category: "จานเดียว", rating: 4.9, preparationTime: 6, popular: true },
    { restaurantId: kaprao._id, name: "ผัดกระเทียมหมู", description: "หมูผัดกระเทียมพริกไทยหอมกรุ่น", image: IMAGES.crispyPork, price: 50, category: "จานเดียว", rating: 4.5, preparationTime: 5, popular: false },
    { restaurantId: kaprao._id, name: "ข้าวไข่เจียวหมูสับ", description: "ไข่เจียวฟูนุ่ม เสิร์ฟพร้อมข้าวสวยร้อนๆ", image: IMAGES.crispyPork, price: 45, category: "จานเดียว", rating: 4.4, preparationTime: 4, popular: false },
    { restaurantId: kaprao._id, name: "น้ำเปล่า", description: "น้ำดื่มขวดเย็น", image: IMAGES.thaiTea, price: 10, category: "เครื่องดื่ม", rating: 4.5, preparationTime: 1, popular: false },

    // ร้านข้าวมันไก่
    { restaurantId: khaoManKai._id, name: "ข้าวมันไก่ต้ม", description: "ไก่ต้มนุ่ม ข้าวมันหอม น้ำจิ้มเต้าเจี้ยว", image: IMAGES.khaoManKai, price: 45, category: "ข้าวมันไก่", rating: 4.7, preparationTime: 4, popular: true },
    { restaurantId: khaoManKai._id, name: "ข้าวมันไก่ทอด", description: "ไก่ทอดกรอบ หอมสมุนไพร", image: IMAGES.khaoManKai, price: 50, category: "ข้าวมันไก่", rating: 4.6, preparationTime: 5, popular: true },
    { restaurantId: khaoManKai._id, name: "ข้าวมันไก่ผสม (ต้ม+ทอด)", description: "รวมทั้งไก่ต้มและไก่ทอดในจานเดียว", image: IMAGES.khaoManKai, price: 55, category: "ข้าวมันไก่", rating: 4.8, preparationTime: 5, popular: true },
    { restaurantId: khaoManKai._id, name: "ข้าวหมูแดง", description: "หมูแดงหมักสูตรเฉพาะ ราดน้ำซอสหอมหวาน", image: IMAGES.jaeMuay, price: 50, category: "จานเดียว", rating: 4.5, preparationTime: 5, popular: false },
    { restaurantId: khaoManKai._id, name: "ข้าวหมูแดงหมูกรอบ", description: "รวมหมูแดงและหมูกรอบ", image: IMAGES.jaeMuay, price: 60, category: "จานเดียว", rating: 4.6, preparationTime: 6, popular: false },
    { restaurantId: khaoManKai._id, name: "ซุปไก่", description: "ซุปไก่ใสร้อนๆ เสิร์ฟคู่ข้าวมันไก่", image: IMAGES.khaoManKai, price: 15, category: "เครื่องเคียง", rating: 4.4, preparationTime: 2, popular: false },

    // ร้านอาหารตามสั่ง
    { restaurantId: tamSang._id, name: "ผัดกระเทียมไก่", description: "ไก่ผัดกระเทียมพริกไทยกรอบนอกนุ่มใน", image: IMAGES.jaeMuay, price: 50, category: "จานเดียว", rating: 4.5, preparationTime: 6, popular: false },
    { restaurantId: tamSang._id, name: "ผัดซีอิ๊วหมู", description: "เส้นใหญ่ผัดซีอิ๊วหอมกระทะ", image: IMAGES.noodle, price: 50, category: "เส้น", rating: 4.6, preparationTime: 6, popular: true },
    { restaurantId: tamSang._id, name: "บะหมี่ไก่ฉีกต้มยำแห้ง", description: "บะหมี่เหนียวนุ่ม ไก่ฉีก รสต้มยำจัดจ้าน", image: IMAGES.noodle, price: 50, category: "เส้น", rating: 4.9, preparationTime: 6, popular: true },
    { restaurantId: tamSang._id, name: "ข้าวผัดหมู", description: "ข้าวผัดหอมกระทะ เสิร์ฟพร้อมแตงกวา", image: IMAGES.jaeMuay, price: 45, category: "จานเดียว", rating: 4.4, preparationTime: 5, popular: false },
    { restaurantId: tamSang._id, name: "ต้มยำกุ้งน้ำข้น", description: "ต้มยำรสจัดจ้าน กุ้งสดตัวโต", image: IMAGES.noodle, price: 65, category: "เส้น", rating: 4.7, preparationTime: 7, popular: false },
    { restaurantId: tamSang._id, name: "ชาไทยเย็น", description: "ชาไทยหอมเข้มข้น หวานมันกำลังดี", image: IMAGES.thaiTea, price: 35, category: "เครื่องดื่ม", rating: 4.9, preparationTime: 2, popular: true },
    { restaurantId: tamSang._id, name: "สมูทตี้มะม่วง", description: "สมูทตี้มะม่วงสดปั่นเข้มข้น", image: IMAGES.cafe, price: 45, category: "เครื่องดื่ม", rating: 4.8, preparationTime: 3, popular: false },
  ]);

  console.log("Seeding users...");
  const passwordHash = await bcrypt.hash("password123", 10);

  await User.create([
    {
      name: "น้องพิม นักศึกษา",
      email: "student@spu.ac.th",
      passwordHash,
      studentId: "63130001",
      phone: "0812345678",
      role: "STUDENT",
    },
    {
      name: "คุณบุคลากร ใจดี",
      email: "staff@spu.ac.th",
      passwordHash,
      studentId: "EMP0001",
      phone: "0898765432",
      role: "STAFF",
    },
    {
      name: "ผู้ดูแลระบบ",
      email: "admin@spu.ac.th",
      passwordHash,
      role: "ADMIN",
    },
    {
      name: "พนักงานร้านกะเพรา SPU",
      email: "restaurant@spu.ac.th",
      passwordHash,
      role: "RESTAURANT_STAFF",
      restaurantId: kaprao._id,
    },
  ]);

  console.log("Seed complete.");
  console.log("Demo accounts (password: password123):");
  console.log("  student@spu.ac.th      (STUDENT)");
  console.log("  staff@spu.ac.th        (STAFF)");
  console.log("  admin@spu.ac.th        (ADMIN)");
  console.log("  restaurant@spu.ac.th   (RESTAURANT_STAFF — ร้านกะเพรา SPU)");

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
