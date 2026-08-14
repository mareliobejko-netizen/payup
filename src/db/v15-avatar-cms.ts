import "dotenv/config";
import { neon } from "@neondatabase/serverless";
const url=process.env.DATABASE_URL;if(!url)throw new Error("DATABASE_URL mancante");const sql=neon(url);
async function run(){
 console.log("💀 PayUp v1.5 Avatar CMS...");
 await sql`CREATE TABLE IF NOT EXISTS avatars (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),slug varchar(80) UNIQUE NOT NULL,name varchar(120) NOT NULL,image_url text NOT NULL,type varchar(20) NOT NULL DEFAULT 'base',active boolean NOT NULL DEFAULT true,seasonal_start varchar(5),seasonal_end varchar(5),keep_after_unlock boolean NOT NULL DEFAULT true,unlock_type varchar(40),unlock_value integer,sort_order integer NOT NULL DEFAULT 0,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now())`;
 await sql`CREATE TABLE IF NOT EXISTS user_avatar_unlocks (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,avatar_id uuid NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,source varchar(40) NOT NULL DEFAULT 'achievement',unlocked_at timestamptz NOT NULL DEFAULT now(),UNIQUE(user_id,avatar_id))`;
 const items=[
 ['classic','Classico','/avatars/classic.svg','base',null,null,true,null,null,10],['hair','Capelli','/avatars/hair.svg','base',null,null,true,null,null,20],['cap','Cappello','/avatars/cap.svg','base',null,null,true,null,null,30],['glasses','Occhiali','/avatars/glasses.svg','base',null,null,true,null,null,40],['headphones','Cuffie','/avatars/headphones.svg','base',null,null,true,null,null,50],['moustache','Baffi','/avatars/moustache.svg','base',null,null,true,null,null,60],['parrot','Pappagallo','/avatars/parrot.svg','base',null,null,true,null,null,70],['cat','Gatto','/avatars/cat.svg','base',null,null,true,null,null,80],['hoodie','Felpa','/avatars/hoodie.svg','base',null,null,true,null,null,90],['crown','Corona','/avatars/crown.svg','base',null,null,true,null,null,100],
 ['ferragosto','Ferragosto Drink','/avatars/special/ferragosto.png','seasonal','08-01','08-31',false,null,null,200],['halloween','Halloween','/avatars/special/halloween.png','seasonal','10-01','11-02',false,null,null,210],['christmas','Natale','/avatars/special/christmas.png','seasonal','12-01','01-06',false,null,null,220],
 ['champion','Champion Skull','/avatars/special/champion.png','unlockable',null,null,true,'season_wins',1,300],['fire','Fire Skull','/avatars/special/fire.png','unlockable',null,null,true,'trending_count',5,310],['money','Money Skull','/avatars/special/money.png','unlockable',null,null,true,'spent_euros',100,320]
 ];
 for(const a of items){await sql`INSERT INTO avatars(slug,name,image_url,type,seasonal_start,seasonal_end,keep_after_unlock,unlock_type,unlock_value,sort_order) VALUES(${a[0]},${a[1]},${a[2]},${a[3]},${a[4]},${a[5]},${a[6]},${a[7]},${a[8]},${a[9]}) ON CONFLICT(slug) DO NOTHING`}
 console.log("✅ Avatar CMS e preset creati.");
}
run().catch(e=>{console.error(e);process.exit(1)});
