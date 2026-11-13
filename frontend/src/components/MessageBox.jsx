const MessageBox = ({ children, role }) => (
  <div
    role={role}
    className='flex min-h-[18rem] items-center justify-center border-2 border-sky-500  bg-gray-100 p-6 text-center'
  >
    <p className='text-2xl font-semibold leading-snug text-slate-700'>
      {children}
    </p>
  </div>
)

export default MessageBox