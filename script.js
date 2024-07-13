// 변수 생성
let userMessages = [];
let assistantMessages = [];
let myDateTime ='';

function start() {
    const date = document.getElementById('date').value;
    const hour = document.getElementById('hour').value;
    if (date == '') {
        alert('생년월일을 입력해주세요.');
        return;
    }
    myDateTime = date + hour;
    document.getElementById("intro").style.display = "none";
    document.getElementById("chat").style.display = "block";
}

async function sendMessage() {
    // 로딩 스피너 아이콘 보이기
    document.getElementById('loader').style.display = "block";

    //사용자의 메시지 가져옴
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value;

    //채팅 말풍선에 사용자의 메시지 출력
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble user-bubble';
    userBubble.textContent = message;
    document.getElementById('fortuneResponse').appendChild(userBubble);

    // userMessages배열에 사용자의 메시지 저장
    userMessages.push(messageInput.value);

    //입력 필드 초기화
    messageInput.value = '';

    // 프론트엔드 재시도 로직
    function sleep(sec){
        return new Promise(resolve => setTimeout(resolve, sec * 1000));
    }

    const maxRetiries = 3;
    let retries = 0; 
    while (retries < maxRetiries) {

    //백엔드 서버에 메시지를 보내고 응답 출력
    try {
        const response = await fetch('https://w4ko2dutva4fjkpxddarycbrqy0mbuvv.lambda-url.ap-northeast-2.on.aws/fortuneTell', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                myDateTime: myDateTime,
                userMessages: userMessages,
                assistantMessages: assistantMessages,
            })
        });

        if (!response.ok) {
            throw new Error('Request failed with status ' + response.status);
        }

        const data = await response.json();

        // 로딩 스피너 아이콘 숨기기
        document.getElementById('loader').style.display = "none";

        // assistantMessages 배열에 GPT의 응답 메시지 저장
        assistantMessages.push(data.assistant);
        console.log('Response:', data);

        // 채팅 말풍선에 챗GPT 응답 출력
        const botBubble = document.createElement('div');
        botBubble.className = 'chat-bubble bot-bubble';
        botBubble.textContent = data.assistant;

        // 후원링크 삽입
        const p = document.createElement('p');
        p.innerHTML = '추가로 링크를 눌러 작은 마음 보내주시면 더욱 좋은 운이 있으실 겁니다. =>';
        const link = document.createElement('a');
        link.href = 'https://toss.me/chatdoge';
        link.innerHTML = '기특한 우리 챗도지 간식보내기';
        p.appendChild(link);
        botBubble.appendChild(p);

        document.getElementById('fortuneResponse').appendChild(botBubble);

    } catch (error) {
        await sleep(0.5);
        retries++;
        console.log(`Error fetching data, retrying (${retries}/${maxRetries})...`);
        if (retries === 3){
            alert("서버가 불안정합니다. 잠시 후 다시 시도해 주세요!")
        }
        console.error('Error:', error);
        }
    }
}