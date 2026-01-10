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
   - Thêm `OPENAI_API_KEY` của bạn vào `.env`.

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

### Lưu ý quan trọng:
- **Agents SDK**: Dự án này phụ thuộc nhiều vào `@openai/agents`. Hãy tham khảo tài liệu của SDK nếu cần tùy chỉnh sâu về luồng agent.
- **WebRTC**: Đảm bảo môi trường mạng cho phép kết nối WebRTC (UDP ports).
