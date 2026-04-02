import { defineConfig } from 'prisma/config'

export default defineConfig({
  datasources: {
    db: {
      url: 'mysql://root:root@localhost:3306/hardware_hub'
    }
  }
})