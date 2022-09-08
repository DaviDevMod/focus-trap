import { singleTrap } from '../../../instrumented/dist/index.module.js';

window.process = {
  env: {
    NODE_ENV: 'test',
  },
};

const trapOne = document.getElementById('trap-one');
const trapTwo = document.getElementById('trap-two');

singleTrap({ action: 'BUILD', config: { root: [trapOne, trapTwo], lock: false } });
