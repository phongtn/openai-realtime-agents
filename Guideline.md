# Hướng dẫn Phát triển Dự án (Guideline)

## 1. Kiến trúc Hệ thống

Dự án này là một ứng dụng web demonstration sử dụng **OpenAI Realtime API** và **OpenAI Agents SDK** để xây dựng các kịch bản hội thoại giọng nói (voice agents) tiên tiến.

### Công nghệ sử dụng:
- **Frontend Framework**: Next.js 15 (App Router) với TypeScript.
- **UI Library**: React 19, Tailwind CSS.
- **AI Integration**:
  - **OpenAI Realtime API**: Cho phép tương tác giọng nói độ trễ thấp qua WebRTC.
  - **OpenAI Agents SDK**: Quản lý logic của agent, chuyển đổi giữa các agent (handoffs) và gọi công cụ (function calling).

### Luồng dữ liệu (Data Flow):
1. **Kết nối**: Client (Browser) gọi API `/api/session` để lấy ephemeral token.
2. **WebRTC**: Client thiết lập kết nối WebRTC trực tiếp với OpenAI Realtime API.
3. **Quản lý Agent**: `useRealtimeSession` hook và `App.tsx` chịu trách nhiệm khởi tạo và quản lý trạng thái của phiên làm việc.
4. **Agent Logic**: Các agent được định nghĩa trong `src/app/agentConfigs` xác định cách phản hồi và các công cụ có sẵn.

## 2. Cấu trúc Folder và Package

Cấu trúc thư mục chính nằm trong `src/app`:

- **`src/app/agentConfigs/`**: Nơi định nghĩa các Agent và kịch bản (Scenarios).
  - `chatSupervisor/`: Kịch bản "Chat-Supervisor" (Agent chat + Supervisor).
  - `customerServiceRetail/`: Kịch bản chăm sóc khách hàng bán lẻ (nhiều agent: auth, returns, sales).
  - `simpleHandoff/`: Kịch bản đơn giản chuyển đổi giữa greeter và haiku writer.
  - `index.ts`: Đăng ký và export các kịch bản để hiển thị trên UI.

- **`src/app/components/`**: Các thành phần giao diện người dùng.
  - `Transcript.tsx`: Hiển thị lại nội dung hội thoại.
  - `Events.tsx`: Log các sự kiện client/server.
  - `BottomToolbar.tsx`: Thanh điều khiển (Mic, PTT, Connection).

- **`src/app/contexts/`**: React Contexts quản lý trạng thái toàn cục.
  - `TranscriptContext.tsx`: Quản lý danh sách tin nhắn.
  - `EventContext.tsx`: Quản lý danh sách sự kiện.

- **`src/app/hooks/`**: Các Custom Hooks quan trọng.
  - `useRealtimeSession.ts`: Hook chính để tương tác với OpenAI Realtime SDK.
  - `useAudioDownload.ts`: Ghi âm hội thoại.

- **`src/app/api/`**: Next.js API Routes.
  - `session/route.ts`: API endpoint để lấy client secret từ OpenAI.

- **`src/app/App.tsx`**: Component chính của ứng dụng, kết nối UI và Logic.

## 3. Hướng dẫn Phát triển

### Cài đặt môi trường:
1. Clone repository.
2. Cài đặt dependencies:
   ```bash
   npm install
   ```
3. Cấu hình biến môi trường:
   - Tạo file `.env` từ `.env.sample`.
   - Thêm `OPENAI_API_KEY` và `BACKEND_API_KEY` vào file `.env`.

### Chạy ứng dụng:
```bash
npm run dev
```
Truy cập `http://localhost:3000` để xem ứng dụng.

### Tạo Agent mới (Scenario mới):
1. **Tạo thư mục**: Tạo thư mục mới trong `src/app/agentConfigs/`, ví dụ `myNewAgent`.
2. **Định nghĩa Agent**: Tạo file `index.ts` (hoặc tên khác) trong thư mục đó, sử dụng `RealtimeAgent` từ SDK.
   ```typescript
   import { RealtimeAgent } from '@openai/agents/realtime';

   export const myAgent = new RealtimeAgent({
     name: 'MyAgent',
     instructions: 'Hướng dẫn cho agent...',
     tools: [], 
   });
   
   export const myScenario = [myAgent];
   ```
3. **Đăng ký Scenario**: Mở `src/app/agentConfigs/index.ts`:
   - Import scenario mới.
   - Thêm vào object `allAgentSets`.
   ```typescript
   import { myScenario } from './myNewAgent';

   export const allAgentSets: Record<string, RealtimeAgent[]> = {
     // ... các scenario cũ
     myNewScenario: myScenario,
   };
   ```
4. **Kiểm thử**: Mở ứng dụng, chọn scenario mới từ dropdown menu "Scenario".

### Thêm Tools (Công cụ):
- Định nghĩa tool trong agent config.
- Cung cấp schema và logic thực thi nếu cần (client-side logic).

---

## 4. Hướng dẫn Thiết lập Kết nối WebRTC

Dự án sử dụng **WebRTC** để truyền tải âm thanh hai chiều theo thời gian thực giữa trình duyệt và OpenAI Realtime API.

### Kiến trúc kết nối:
```
┌─────────────┐      1. Lấy Token       ┌──────────────────┐
│   Browser   │ ──────────────────────▶ │  /api/session    │
│  (Client)   │ ◀────────────────────── │  (Next.js API)   │
└─────────────┘   Ephemeral Token       └──────────────────┘
       │                                         │
       │  2. WebRTC Offer/Answer                 │ POST to OpenAI
       ▼                                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 OpenAI Realtime API (WebRTC)                │
│              (gpt-4o-realtime-preview-2025-06-03)           │
└─────────────────────────────────────────────────────────────┘
```

### Luồng kết nối chi tiết:

#### Bước 1: Lấy Ephemeral Token
Client gọi API `/api/session` để lấy token tạm thời (ephemeral key) từ OpenAI.

**File:** `src/app/api/session/route.ts`
```typescript
const response = await fetch("https://lang-tutor-722229371534.asia-southeast1.run.app/session", {
  method: "POST",
  headers: {
    Authorization: `${process.env.BACKEND_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "gpt-4o-realtime-preview-2025-06-03",
  }),
});
```
> **Lưu ý:** Token này có thời hạn ngắn và chỉ dùng một lần để thiết lập kết nối WebRTC.

#### Bước 2: Khởi tạo RealtimeSession với WebRTC Transport
Hook `useRealtimeSession` tạo `RealtimeSession` sử dụng `OpenAIRealtimeWebRTC` làm transport layer.

**File:** `src/app/hooks/useRealtimeSession.ts`
```typescript
import { RealtimeSession, OpenAIRealtimeWebRTC } from '@openai/agents/realtime';

sessionRef.current = new RealtimeSession(rootAgent, {
  transport: new OpenAIRealtimeWebRTC({
    audioElement,  // HTML Audio element để phát âm thanh từ server
    changePeerConnection: async (pc: RTCPeerConnection) => {
      applyCodec(pc);  // Thiết lập codec ưu tiên
      return pc;
    },
  }),
  model: 'gpt-4o-realtime-preview-2025-06-03',
  config: {
    inputAudioTranscription: {
      model: 'gpt-4o-mini-transcribe',  // Model transcribe đầu vào
    },
  },
});

await sessionRef.current.connect({ apiKey: ephemeralKey });
```

#### Bước 3: Thiết lập RTCPeerConnection
SDK tự động:
1. Tạo `RTCPeerConnection`.
2. Thêm audio track từ microphone của người dùng.
3. Tạo SDP Offer gửi đến OpenAI.
4. Nhận SDP Answer và hoàn tất kết nối.

### Cấu hình Codec âm thanh:
Dự án hỗ trợ chọn codec qua query parameter `?codec=`:
- `opus` (mặc định): Chất lượng cao, 48 kHz.
- `pcmu` / `pcma`: Băng thông hẹp 8 kHz, mô phỏng chất lượng điện thoại PSTN.

**File:** `src/app/lib/codecUtils.ts`
```typescript
export function applyCodecPreferences(pc: RTCPeerConnection, codec: string): void {
  const caps = RTCRtpSender.getCapabilities?.('audio');
  const pref = caps.codecs.find(c => c.mimeType.toLowerCase() === `audio/${codec}`);
  pc.getTransceivers()
    .filter(t => t.sender?.track?.kind === 'audio')
    .forEach(t => t.setCodecPreferences([pref]));
}
```

### Quản lý phiên làm việc:
- **Kết nối:** `connect()` trong `useRealtimeSession`.
- **Ngắt kết nối:** `disconnect()` đóng session và giải phóng tài nguyên.
- **Mute/Unmute:** `mute(true/false)` tắt/bật âm thanh gửi đi.
- **Interrupt:** `interrupt()` ngắt phản hồi đang phát.

### Xử lý sự kiện:
Session lắng nghe các sự kiện từ server:
```typescript
sessionRef.current.on("transport_event", handleTransportEvent);
sessionRef.current.on("agent_handoff", handleAgentHandoff);
sessionRef.current.on("guardrail_tripped", handleGuardrailTripped);
```

### Khắc phục sự cố WebRTC:

| Vấn đề | Nguyên nhân | Giải pháp |
|--------|-------------|-----------|
| Không kết nối được | Firewall chặn UDP | Mở UDP ports hoặc dùng TURN server |
| Không nghe được | Audio element chưa play | Kiểm tra `audioElement.play()` |
| Âm thanh bị gián đoạn | Mạng không ổn định | Kiểm tra kết nối internet |
| Token expired | Token đã hết hạn | Gọi lại `/api/session` để lấy token mới |

### Yêu cầu môi trường:
- **HTTPS**: WebRTC yêu cầu kết nối HTTPS (localhost được miễn trừ).
- **Quyền Microphone**: Người dùng cần cấp quyền truy cập microphone.
- **Browser hỗ trợ**: Chrome, Firefox, Edge, Safari phiên bản mới.

---

### Lưu ý quan trọng:
- **Agents SDK**: Dự án này phụ thuộc nhiều vào `@openai/agents`. Hãy tham khảo tài liệu của SDK nếu cần tùy chỉnh sâu về luồng agent.
- **WebRTC**: Đảm bảo môi trường mạng cho phép kết nối WebRTC (UDP ports).
