class PeerService {
  constructor() {
      if (!this.peer) {
          this.peer = new RTCPeerConnection({
              iceServers: [
                  {
                      urls: [
                          "stun:stun.l.google.com:19302",
                          "stun:global.stun.twilio.com:3478",
                      ],
                  },
              ],
          });
      }
  }

  async getAnswer(offer) {
      if (!this.peer) return;

      // Prevent setting remote description if already stable
      if (this.peer.signalingState !== "stable") {
          console.warn("Skipping setRemoteDescription: Already stable");
          return;
      }

      await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
      const ans = await this.peer.createAnswer();
      await this.peer.setLocalDescription(ans);
      return ans;
  }

  async setLocalDescription(ans) {
      if (!this.peer) return;

      
      if (this.peer.signalingState !== "stable") {
          console.warn("Skipping setLocalDescription: Already stable");
          return;
      }

      await this.peer.setLocalDescription(new RTCSessionDescription(ans));
  }

  async getOffer() {
      if (!this.peer) return;

      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(offer);
      return offer;
  }
}

export default new PeerService();
