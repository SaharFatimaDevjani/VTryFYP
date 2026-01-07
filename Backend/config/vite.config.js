import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      'datatables.net': require.resolve('datatables.net'),
      'datatables.net-dt': require.resolve('datatables.net-dt'),
    },
  },
});
