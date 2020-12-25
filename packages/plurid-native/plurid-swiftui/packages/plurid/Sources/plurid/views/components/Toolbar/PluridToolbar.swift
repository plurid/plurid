import SwiftUI



struct PluridToolbar: View {
    var body: some View {
        VStack {
            HStack {
                Text("toolbar")
            }.frame(
                alignment: .center
            )
        }.frame(
            alignment: .bottom
        )
    }
}


struct PluridToolbar_Previews: PreviewProvider {
    static var previews: some View {
        PluridToolbar()
    }
}
