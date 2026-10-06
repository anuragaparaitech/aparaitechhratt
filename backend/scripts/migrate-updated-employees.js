import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('✅ Connected to MongoDB Atlas')

  const defaultSalt = await bcrypt.genSalt(10)
  const defaultHashedPassword = await bcrypt.hash('Aparaitech123@', defaultSalt)

  // 1. Update Hemant Pawar (AP7098)
  console.log('🔄 Updating Hemant Pawar (AP7098)...')
  const hemant = await mongoose.connection.db.collection('employees').findOne({
    $or: [{ empId: 'AP7098' }, { email: 'hemantbp9172@gmail.com' }]
  })
  if (hemant) {
    await mongoose.connection.db.collection('employees').updateOne(
      { _id: hemant._id },
      {
        $set: {
          name: 'Hemant Pawar',
          empId: 'AP7098',
          email: 'hemantbp9172@gmail.com',
          phone: '9172948195',
          dob: '2001-04-02',
          department: 'BDA',
          designation: 'BDA',
          status: 'active',
          role: 'employee',
          shift: 'shift_2',
          plainPassword: 'Aparaitech123@',
          password: defaultHashedPassword,
          passcode: '1234'
        }
      }
    )
    console.log('✅ Hemant Pawar updated successfully (DOB: 2001-04-02, password reset to Aparaitech123@, passcode: 1234, active)')
  } else {
    await mongoose.connection.db.collection('employees').insertOne({
      name: 'Hemant Pawar',
      empId: 'AP7098',
      email: 'hemantbp9172@gmail.com',
      phone: '9172948195',
      dob: '2001-04-02',
      department: 'BDA',
      designation: 'BDA',
      status: 'active',
      role: 'employee',
      shift: 'shift_2',
      plainPassword: 'Aparaitech123@',
      password: defaultHashedPassword,
      passcode: '1234',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    console.log('✅ Hemant Pawar created successfully')
  }

  // 2. Update Sanika Panaskar (AP7104) -> email: sanikapanskar19@gmail.com, dob: 2004-06-05
  console.log('🔄 Updating Sanika Panaskar (AP7104)...')
  const sanika = await mongoose.connection.db.collection('employees').findOne({
    $or: [{ empId: 'AP7104' }, { email: 'sanikapanskar19@gmail.com' }, { email: 'sanikapanaskar19@gmail.com' }]
  })
  const oldSanikaEmail = sanika ? sanika.email : 'sanikapanaskar19@gmail.com'
  const newSanikaEmail = 'sanikapanskar19@gmail.com'

  if (sanika) {
    await mongoose.connection.db.collection('employees').updateOne(
      { _id: sanika._id },
      {
        $set: {
          name: 'Sanika Panaskar',
          empId: 'AP7104',
          email: newSanikaEmail,
          dob: '2004-06-05',
          phone: sanika.phone || '9325069174',
          department: 'BDA',
          designation: 'BDA',
          status: 'active',
          role: 'employee',
          shift: 'shift_2',
          plainPassword: sanika.plainPassword || 'Aparaitech123@',
          passcode: sanika.passcode || '1234'
        }
      }
    )
    console.log(`✅ Sanika Panaskar updated successfully (email: ${newSanikaEmail}, DOB: 2004-06-05)`)
  } else {
    await mongoose.connection.db.collection('employees').insertOne({
      name: 'Sanika Panaskar',
      empId: 'AP7104',
      email: newSanikaEmail,
      dob: '2004-06-05',
      phone: '9325069174',
      department: 'BDA',
      designation: 'BDA',
      status: 'active',
      role: 'employee',
      shift: 'shift_2',
      plainPassword: 'Aparaitech123@',
      password: defaultHashedPassword,
      passcode: '1234',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    console.log('✅ Sanika Panaskar created successfully')
  }

  // Cascade Sanika's email update in collections
  if (oldSanikaEmail !== newSanikaEmail) {
    const cols = ['attendances', 'activesessions', 'dailyreports', 'leaves', 'messages', 'tasks', 'leads']
    for (const col of cols) {
      try {
        await mongoose.connection.db.collection(col).updateMany({ employeeEmail: oldSanikaEmail }, { $set: { employeeEmail: newSanikaEmail } })
        await mongoose.connection.db.collection(col).updateMany({ email: oldSanikaEmail }, { $set: { email: newSanikaEmail } })
      } catch (e) {}
    }
  }

  // 3. Update Komal Mallikarjun Talwar (AP7103) -> replaces Liza / creates Komal
  console.log('🔄 Updating Komal Mallikarjun Talwar (AP7103)...')
  const komalOrLiza = await mongoose.connection.db.collection('employees').findOne({
    $or: [{ empId: 'AP7103' }, { email: 'talwarkomalmk@gmail.com' }, { email: 'liza@aparaitech.com' }]
  })
  if (komalOrLiza) {
    await mongoose.connection.db.collection('employees').updateOne(
      { _id: komalOrLiza._id },
      {
        $set: {
          name: 'Komal Mallikarjun Talwar',
          empId: 'AP7103',
          email: 'talwarkomalmk@gmail.com',
          phone: '9699248913',
          dob: '2004-07-17',
          department: 'BDA',
          designation: 'BDA',
          status: 'active',
          role: 'employee',
          shift: 'shift_2',
          plainPassword: 'Aparaitech123@',
          password: defaultHashedPassword,
          passcode: '1234'
        }
      }
    )
    console.log('✅ Komal Mallikarjun Talwar updated successfully for AP7103')
  } else {
    await mongoose.connection.db.collection('employees').insertOne({
      name: 'Komal Mallikarjun Talwar',
      empId: 'AP7103',
      email: 'talwarkomalmk@gmail.com',
      phone: '9699248913',
      dob: '2004-07-17',
      department: 'BDA',
      designation: 'BDA',
      status: 'active',
      role: 'employee',
      shift: 'shift_2',
      plainPassword: 'Aparaitech123@',
      password: defaultHashedPassword,
      passcode: '1234',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    console.log('✅ Komal Mallikarjun Talwar created successfully for AP7103')
  }

  // 4. Update Nikita Maruti Survase (AP7087)
  console.log('🔄 Verifying & Updating Nikita Maruti Survase (AP7087)...')
  const nikita = await mongoose.connection.db.collection('employees').findOne({
    $or: [{ empId: 'AP7087' }, { email: 'nikitasurvase2125@gmail.com' }]
  })
  if (nikita) {
    await mongoose.connection.db.collection('employees').updateOne(
      { _id: nikita._id },
      {
        $set: {
          name: 'Nikita Maruti Survase',
          empId: 'AP7087',
          email: 'nikitasurvase2125@gmail.com',
          phone: '8055055645',
          dob: '2001-08-03',
          department: 'BDA',
          designation: 'BDA',
          status: 'active',
          shift: 'shift_2'
        }
      }
    )
    console.log('✅ Nikita Maruti Survase verified and updated (DOB: 2001-08-03, Phone: 8055055645)')
  }

  // 5. Update Ashvini Rajput (AP7096) -> email: rajputaashu204@gmail.com
  console.log('🔄 Updating Ashvini Rajput (AP7096) email to rajputaashu204@gmail.com...')
  const ashvini = await mongoose.connection.db.collection('employees').findOne({
    $or: [{ empId: 'AP7096' }, { email: 'rajputashu204@gmail.com' }, { email: 'rajputaashu204@gmail.com' }]
  })
  const oldAshviniEmail = ashvini ? ashvini.email : 'rajputashu204@gmail.com'
  const newAshviniEmail = 'rajputaashu204@gmail.com'

  if (ashvini) {
    await mongoose.connection.db.collection('employees').updateOne(
      { _id: ashvini._id },
      {
        $set: {
          name: ashvini.name || 'Ashvini Sanjay Rajput',
          empId: 'AP7096',
          email: newAshviniEmail,
          phone: ashvini.phone || '9359549993',
          department: 'BDA',
          designation: 'BDA',
          status: 'active',
          shift: 'shift_2'
        }
      }
    )
    console.log(`✅ Ashvini Rajput email updated successfully to ${newAshviniEmail}`)
  }

  // Cascade Ashvini's email update in collections
  if (oldAshviniEmail !== newAshviniEmail) {
    const cols = ['attendances', 'activesessions', 'dailyreports', 'leaves', 'messages', 'tasks', 'leads']
    for (const col of cols) {
      try {
        const r1 = await mongoose.connection.db.collection(col).updateMany({ employeeEmail: oldAshviniEmail }, { $set: { employeeEmail: newAshviniEmail } })
        const r2 = await mongoose.connection.db.collection(col).updateMany({ email: oldAshviniEmail }, { $set: { email: newAshviniEmail } })
        if (r1.modifiedCount > 0 || r2.modifiedCount > 0) {
          console.log(`  Updated ${r1.modifiedCount + r2.modifiedCount} records in ${col} for Ashvini`)
        }
      } catch (e) {}
    }
  }

  console.log('\n--- VERIFICATION OF UPDATED EMPLOYEES ---')
  const updatedEmps = await mongoose.connection.db.collection('employees').find({
    empId: { $in: ['AP7098', 'AP7104', 'AP7103', 'AP7087', 'AP7096'] }
  }).sort({ empId: 1 }).toArray()

  updatedEmps.forEach(e => {
    console.log(`[${e.empId}] ${e.name} | Email: ${e.email} | Phone: ${e.phone} | DOB: ${e.dob} | Dept: ${e.department} | Status: ${e.status}`)
  })

  await mongoose.disconnect()
  console.log('✅ Migration complete!')
}

migrate().catch(err => {
  console.error('Migration error:', err)
  process.exit(1)
})
