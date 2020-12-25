import SwiftUI



public struct PluridView: View {
    var planes: [String]

    let colors = Gradient(
        colors: [
            Color("pluridPrimary"),
            Color("pluridTertiary"),
        ]
    )

    public var body: some View {
        ZStack {
            RadialGradient(
                gradient: colors,
                center: .center,
                startRadius: 0,
                endRadius: 800
            )

            Text("Some very long text")
                .font(.largeTitle)
                .foregroundColor(.yellow)
                .rotation3DEffect(
                    .degrees(53),
                    axis: (x: 0, y: 1, z: 0)
                )
        }
    }
}

struct PluridView_Previews: PreviewProvider {
    static var previews: some View {
        PluridView(
        planes: ["on", "two"])
            .previewLayout(
                .fixed(width: 1024, height: 768)
            )
    }
}
