import SwiftUI



struct PluridToolbar: View {
    var body: some View {
        VStack {
            HStack {
                Text("toolbar")
            }
            .frame(
                alignment: .center
            )
            .padding()
            .frame(
                width: 300,
                height: 50
            )
            .background(
                Capsule()
                .fill(
                    Color("pluridTertiary")
                )
            )
        }
        .frame(
            alignment: .bottom
        )
    }
}


struct PluridToolbar_Previews: PreviewProvider {
    static var previews: some View {
        PluridToolbar()
    }
}
