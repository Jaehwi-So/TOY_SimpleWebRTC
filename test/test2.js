const { execSync } = require('child_process');


// macOS 또는 Linux에서 실행 중인 어플리케이션 정보 가져오기
const getRunningApplications = () => {
    const result = execSync('ps -A -o comm=', { encoding: 'utf-8' });
    let applications = result.trim().split('\n');
    const res = applications.filter(str => str.startsWith("/Applications"));

    console.log(res);
  };
  
  getRunningApplications();